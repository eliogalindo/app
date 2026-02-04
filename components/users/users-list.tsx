"use client";

import {
  Selection,
  ChipProps,
  SortDescriptor,
  useDisclosure,
} from "@heroui/react";
import { useTranslations, useLocale } from "next-intl";
import React, {
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
      // Select all permissions
      return users.map((user) => user.id);
    }
    // Otherwise, select only the checked ones

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
        setRefresh((prev) => !prev); // Trigger a refresh
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
        setRefresh((prev) => !prev); // Trigger a refresh
        onOpenChange();
      } else {
        const { detail } = await response?.json();

        toast("danger", detail);
      }
    }
    setIsDeleting(false);
  };

  // Debounce filterValue changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filterValue);
    }, 400); // 400 ms debounce

    return () => clearTimeout(handler);
  }, [filterValue]);

  // Fetch users from the backend when debouncedFilter changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await usersService.findAll(
        {
          pageSize: rowsPerPage,
          pageNumber: page,
          orderBy: sortDescriptor.column.toString(),
          desc: sortDescriptor.direction === "descending",
          filter: debouncedFilter, // use debounced value here
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
    debouncedFilter, // use debounced value here
    visibleColumns,
    refresh,
  ]);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const toast = (color: ColorType, description: string) =>
    addToast({
      color: color,
      description: description,
      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });

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

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder={t("searchPlaceholder")}
            startContent={<IconListSearch stroke={1} />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            {usersSelected.length > 1 && (
              <Button
                color="danger"
                endContent={<IconTrash size="20" />}
                variant="flat"
                onPress={onOpen}
              >
                {tCommon("delete")}
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
            <Button
              color="primary"
              endContent={<IconPlus />}
              onPress={() => router.push(`${pathname}/add`)}
            >
              {tCommon("addNew")}
            </Button>
          </div>
        </div>
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
    hasSearchFilter,
    rowsPerPage,
    usersSelected,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
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
  }, [selectedKeys, users.length, page, totalPages]);

  return (
    <>
      <Table
        isHeaderSticky
        aria-label="Users List"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[382px]",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
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
      <DeleteConfirmationModal
        isDeleting={isDeleting}
        isOpen={isOpen}
        onCancelAction={() => setSelectedKeys(new Set())}
        onDeleteAction={onDelete}
        onOpenChangeAction={onOpenChange}
      />
    </>
  );
}
