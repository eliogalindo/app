"use client";

import {
  Selection,
  ChipProps,
  SortDescriptor,
  useDisclosure,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Checkbox,
} from "@heroui/react";
import { useTranslations, useLocale } from "next-intl";
import {
  ChangeEvent,
  Key,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  User,
  Pagination,
  Spinner,
  addToast,
} from "@heroui/react";
import {
  IconEdit,
  IconEye,
  IconTrash,
  IconPlus,
  IconChevronDown,
  IconListSearch,
  IconDotsVertical,
} from "@tabler/icons-react";

import { usersService } from "@/services/usersService";
import { IUser } from "@/interfaces/user";
import { API_URL } from "@/constants";
import { usePathname, useRouter } from "@/i18n/navigation";
import DeleteConfirmationModal from "@/components/modals/delete-confirmation";
import defaultAvatar from "@/public/user.png";
import { ColorType } from "@/types";
import { utcToLocal } from "@/helpers/dateFormatter";

export default function UsersList() {
  const locale = useLocale();
  const t = useTranslations("Users");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const pathname = usePathname();

  const statusColorMap: Record<number, ChipProps["color"]> = {
    0: "success",
    1: "danger",
    2: "warning",
  };

  const INITIAL_VISIBLE_COLUMNS = [
    "fullName",
    "username",
    "phone",
    "status",
    "createdAt",
    "actions",
  ];

  const columns = [
    { name: t("fullName"), uid: "fullName", sortable: true },
    { name: t("username"), uid: "username", sortable: true },
    { name: t("email"), uid: "email", sortable: true },
    { name: t("phone"), uid: "phone", sortable: true },
    { name: t("status"), uid: "status", sortable: true },
    { name: tCommon("createdAt"), uid: "createdAt", sortable: true },
    { name: tCommon("actions"), uid: "actions" },
  ];

  const statusLabelMap: Record<number, string> = {
    0: t("statusValues.enabled"),
    1: t("statusValues.disabled"),
    2: t("statusValues.pending"),
  };

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "fullName",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  // Back-end data
  const [users, setUsers] = useState<IUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [debouncedFilter, setDebouncedFilter] = useState(filterValue);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const usersSelected = useMemo(() => {
    if (selectedKeys === "all") {
      return users.map((user) => user.id);
    }
    return Array.from(selectedKeys) as string[];
  }, [selectedKeys, users]);

  const onEdit = (id: string) => router.push(`${pathname}/edit/${id}`);
  const onView = (id: string) => router.push(`${pathname}/view/${id}`);

  const onDelete = async () => {
    setIsDeleting(true);
    if (usersSelected.length === 1) {
      const [id] = usersSelected;
      const response = await usersService.delete(id);

      if (response?.ok) {
        toast("success", t("messages.deleteSuccess"));
        setSelectedKeys(new Set());
        setRefresh((prev) => !prev);
        onOpenChange();
      } else {
        const { detail } = await response?.json();
        toast("danger", detail);
      }
    } else {
      const response = await usersService.deleteMany(usersSelected);

      if (response?.ok) {
        toast("success", t("messages.deleteManySuccess"));
        setSelectedKeys(new Set());
        setRefresh((prev) => !prev);
        onOpenChange();
      } else {
        const { detail } = await response?.json();
        toast("danger", detail);
      }
    }
    setIsDeleting(false);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filterValue);
    }, 400);
    return () => clearTimeout(handler);
  }, [filterValue]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await usersService.findAll(
        {
          pageSize: rowsPerPage,
          pageNumber: page,
          orderBy: sortDescriptor.column.toString(),
          desc: sortDescriptor.direction === "descending",
          filter: debouncedFilter,
        },
        locale,
      );

      if (response?.ok) {
        const { items, count } = await response.json();
        setUsers(items);
        setTotalUsers(count);
      } else {
        const { detail } = await response?.json();
        setUsers([]);
        setTotalUsers(0);
        toast("danger", detail);
      }
      setIsLoading(false);
    };

    void fetchData();
  }, [
    rowsPerPage,
    page,
    sortDescriptor,
    debouncedFilter,
    visibleColumns,
    refresh,
  ]);

  const toast = (color: ColorType, description: string) =>
    addToast({
      color: color,
      description: description,
      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  // --- Helpers for Mobile/Card View ---

  const handleCardSelection = (id: string) => {
    setSelectedKeys((prev) => {
      const currentKeys = new Set(
        prev === "all" ? users.map((u) => u.id.toString()) : prev,
      );
      if (currentKeys.has(id)) {
        currentKeys.delete(id);
      } else {
        currentKeys.add(id);
      }
      return new Set(currentKeys);
    });
  };

  // Reusable Actions Menu
  const renderActions = (user: IUser) => (
    <Dropdown backdrop="transparent">
      <DropdownTrigger>
        <Button isIconOnly size="sm" variant="light">
          <IconDotsVertical className="text-default-300" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Actions">
        <DropdownItem
          key="view"
          description={t("actionDescriptions.viewDescription")}
          startContent={<IconEye size={20} />}
          onPress={() => onView(user.id)}
        >
          {tCommon("view")}
        </DropdownItem>
        <DropdownItem
          key="edit"
          description={t("actionDescriptions.editDescription")}
          startContent={<IconEdit size={20} />}
          onPress={() => onEdit(user.id)}
        >
          {tCommon("edit")}
        </DropdownItem>
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          description={t("actionDescriptions.deleteDescription")}
          startContent={<IconTrash size={20} />}
          onPress={() => {
            setSelectedKeys(new Set([user.id.toString()]));
            onOpen();
          }}
        >
          {tCommon("delete")}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  const renderCell = useCallback((user: IUser, columnKey: Key) => {
    const cellValue = user[columnKey as keyof IUser];

    switch (columnKey) {
      case "fullName":
        return (
          <User
            avatarProps={{
              radius: "full",
              src: user?.avatar
                ? `${API_URL}/uploads/${user?.avatar}`
                : defaultAvatar.src,
            }}
            description={user.email}
            name={cellValue}
          >
            {user.email}
          </User>
        );
      case "status":
        return (
          <Chip color={statusColorMap[user.status]} size="sm" variant="flat">
            {statusLabelMap[user.status]}
          </Chip>
        );
      case "createdAt":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">{utcToLocal(user.createdAt)}</p>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            {renderActions(user)}
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onNextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const onPreviousPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const onRowsPerPageChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    [],
  );

  const onSearchChange = useCallback((value?: string) => {
    setFilterValue(value || "");
    setPage(1);
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const totalPages = Math.ceil(totalUsers / rowsPerPage) || 1;

  // --- Top Content (Responsive) ---
  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4 mb-4">
        {/* Main container: Column in mobile, Row in desktop */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 items-end">
          {/* Search input */}
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder={t("searchPlaceholder")}
            startContent={<IconListSearch stroke={1} />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          {/*Buttons group: Column in mobile (w-full), row in desktop (w-auto) */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Delete button: Shows up in mobile list and desktop row */}
            {usersSelected.length > 0 && (
              <Button
                color="danger"
                endContent={<IconTrash size="20" />}
                variant="flat"
                onPress={onOpen}
                className="w-full sm:w-auto"
              >
                {tCommon("delete")} ({usersSelected.length})
              </Button>
            )}

            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<IconChevronDown className="text-small" />}
                  variant="flat"
                >
                  {tCommon("columns")}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid}>{column.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            {/* Add Button */}
            <Button
              color="primary"
              endContent={<IconPlus />}
              onPress={() => router.push(`${pathname}/add`)}
              className="w-full sm:w-auto"
            >
              {tCommon("addNew")}
            </Button>
          </div>
        </div>

        {/* Info and Paginator per page */}
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total: {totalUsers} {t("users")}
          </span>
          <label className="flex items-center text-default-400 text-small">
            {tCommon("rowsPerPage")}:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              value={rowsPerPage}
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    totalUsers,
    rowsPerPage,
    usersSelected,
  ]);

  // --- Bottom Content (Pagination) ---
  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center mt-4">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? tCommon("allItemsSelected")
            : `${selectedKeys.size} ${tCommon("of")} ${totalUsers} ${tCommon("selected")}`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={totalPages}
          onChange={setPage}
        />
        <div className="hidden sm:flex w-[30%] justify-end gap-2">
          <Button
            isDisabled={page === 1}
            size="sm"
            variant="flat"
            onPress={onPreviousPage}
          >
            {tCommon("previous")}
          </Button>
          <Button
            isDisabled={page === totalPages}
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            {tCommon("next")}
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, users.length, page, totalPages, totalUsers]);

  return (
    <div className="w-full">
      {topContent}

      {/* --- DESKTOP VIEW (TABLE) --- */}
      <div className="hidden md:block">
        <Table
          isHeaderSticky
          aria-label="Users List Table"
          classNames={{
            wrapper: "max-h-[382px]",
          }}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          sortDescriptor={sortDescriptor}
          onSelectionChange={setSelectedKeys}
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            emptyContent={t("noUsersFound")}
            isLoading={isLoading}
            items={users}
            loadingContent={<Spinner size="lg" />}
          >
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW (CARDS) --- */}
      <div className="block md:hidden">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-4 text-default-400">
            {t("noUsersFound")}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {users.map((user) => {
              const isSelected =
                selectedKeys === "all" || selectedKeys.has(user.id.toString());

              return (
                <Card
                  key={user.id}
                  isPressable
                  className={`w-full transition-all ${
                    isSelected
                      ? "border-2 border-primary"
                      : "border-2 border-transparent"
                  }`}
                  onPress={() => handleCardSelection(user.id.toString())}
                >
                  <CardHeader className="justify-between items-start gap-3">
                    <div className="flex gap-3 items-center">
                      {/* Visual Checkbox, without pointer to avoid blocking the click on the card */}
                      <div className="pointer-events-none">
                        <Checkbox isSelected={isSelected} />
                      </div>

                      <User
                        avatarProps={{
                          radius: "full",
                          src: user?.avatar
                            ? `${API_URL}/uploads/${user?.avatar}`
                            : defaultAvatar.src,
                        }}
                        description={user.email}
                        name={user.fullName}
                      />
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {/* stopPropagation avoids selecting the card when opening the menu */}
                      <div onPointerDown={(e) => e.stopPropagation()}>
                        {renderActions(user)}
                      </div>
                      <Chip
                        color={statusColorMap[user.status]}
                        size="sm"
                        variant="flat"
                        className="mt-1"
                      >
                        {statusLabelMap[user.status]}
                      </Chip>
                    </div>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <div className="flex flex-col gap-2 text-small">
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          {t("username")}:
                        </span>
                        <span>{user.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">{t("phone")}:</span>
                        <span>{user.phone || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500">
                          {tCommon("createdAt")}:
                        </span>
                        <span>{utcToLocal(user.createdAt)}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {bottomContent}

      <DeleteConfirmationModal
        isDeleting={isDeleting}
        isOpen={isOpen}
        onCancelAction={() => setSelectedKeys(new Set())}
        onDeleteAction={onDelete}
        onOpenChangeAction={onOpenChange}
      />
    </div>
  );
}
