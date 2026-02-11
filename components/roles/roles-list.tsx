"use client";

import {
  Selection,
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

import { rolesService } from "@/services/rolesService";
import { IRole } from "@/interfaces/role";
import { usePathname, useRouter } from "@/i18n/navigation";
import DeleteConfirmationModal from "@/components/modals/delete-confirmation";
import { ColorType } from "@/types";
import { utcToLocal } from "@/helpers/dateFormatter";

export default function RolesList() {
  const locale = useLocale();
  const t = useTranslations("Roles");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const pathname = usePathname();

  const INITIAL_VISIBLE_COLUMNS = [
    "denomination",
    "description",
    "enabled",
    "createdAt",
    "actions",
  ];

  const columns = [
    { name: t("denomination"), uid: "denomination", sortable: true },
    { name: t("description"), uid: "description", sortable: true },
    { name: t("enabled"), uid: "enabled", sortable: true },
    { name: tCommon("createdAt"), uid: "createdAt", sortable: true },
    { name: tCommon("actions"), uid: "actions" },
  ];

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "denomination",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  // Back-end data
  const [roles, setRoles] = useState<IRole[]>([]);
  const [totalRoles, setTotalRoles] = useState(0);
  const [debouncedFilter, setDebouncedFilter] = useState(filterValue);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const rolesSelected = useMemo(() => {
    if (selectedKeys === "all") {
      return roles.map((role) => role.id.toString());
    }
    return Array.from(selectedKeys) as string[];
  }, [selectedKeys, roles]);

  const onEdit = (id: string) => router.push(`${pathname}/edit/${id}`);
  const onView = (id: string) => router.push(`${pathname}/view/${id}`);

  const onDelete = async () => {
    setIsDeleting(true);
    if (rolesSelected.length === 1) {
      const [id] = rolesSelected;
      const response = await rolesService.delete(id);

      if (response?.ok) {
        toast("success", t("messages.deleteSuccess"));
        setSelectedKeys(new Set());
        setRefresh((prev) => !prev);
        onOpenChange();
      } else {
        const detail = await response?.json();
        toast("danger", detail?.detail || t("messages.deleteError"));
      }
    } else {
      const response = await rolesService.deleteMany(rolesSelected);

      if (response?.ok) {
        toast("success", t("messages.deleteManySuccess"));
        setSelectedKeys(new Set());
        setRefresh((prev) => !prev);
        onOpenChange();
      } else {
        const detail = await response?.json();
        toast("danger", detail?.detail || t("messages.deleteManyError"));
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
      const response = await rolesService.findAll(
        {
          pageSize: rowsPerPage,
          pageNumber: page,
          orderBy: sortDescriptor.column.toString(),
          desc: sortDescriptor.direction === "descending",
          filter: debouncedFilter,
          enabledOnly: false,
        },
        locale,
      );

      if (response?.ok) {
        const { items, count } = await response.json();
        setRoles(items);
        setTotalRoles(count);
      } else {
        setRoles([]);
        setTotalRoles(0);
        toast("danger", t("messages.fetchError"));
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
        prev === "all" ? roles.map((r) => r.id.toString()) : prev,
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
  const renderActions = (role: IRole) => (
    <Dropdown backdrop="transparent">
      <DropdownTrigger>
        <Button as={"div"} isIconOnly size="sm" variant="light">
          <IconDotsVertical className="text-default-300" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Actions">
        <DropdownItem
          key="view"
          description={t("actionDescriptions.viewDescription")}
          startContent={<IconEye size={20} />}
          onPress={() => onView(role.id.toString())}
        >
          {tCommon("view")}
        </DropdownItem>
        <DropdownItem
          key="edit"
          description={t("actionDescriptions.editDescription")}
          startContent={<IconEdit size={20} />}
          onPress={() => onEdit(role.id.toString())}
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
            setSelectedKeys(new Set([role.id.toString()]));
            onOpen();
          }}
        >
          {tCommon("delete")}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  const renderCell = useCallback((role: IRole, columnKey: Key) => {
    const cellValue = role[columnKey as keyof IRole];

    switch (columnKey) {
      case "denomination":
        return <p className="text-bold text-small capitalize">{cellValue}</p>;
      case "description":
        return (
          <p className="max-w-xs lg:max-w-sm whitespace-nowrap text-small overflow-hidden text-ellipsis">
            {cellValue || tCommon("noDescription")}
          </p>
        );
      case "enabled":
        return (
          <Chip
            color={role.enabled ? "success" : "danger"}
            size="sm"
            variant="flat"
          >
            {role.enabled ? tCommon("yes") : tCommon("no")}
          </Chip>
        );
      case "createdAt":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">{utcToLocal(role.createdAt)}</p>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            {renderActions(role)}
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

  const totalPages = Math.ceil(totalRoles / rowsPerPage) || 1;

  // --- Top Content (Responsive) ---
  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder={t("searchPlaceholder")}
            startContent={<IconListSearch stroke={1} />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {rolesSelected.length > 0 && (
              <Button
                color="danger"
                endContent={<IconTrash size="20" />}
                variant="flat"
                onPress={onOpen}
                className="w-full sm:w-auto"
              >
                {tCommon("delete")} ({rolesSelected.length})
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
              className="w-full sm:w-auto"
            >
              {tCommon("addNew")}
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total: {totalRoles} {t("roles")}
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
    totalRoles,
    rowsPerPage,
    rolesSelected,
  ]);

  // --- Bottom Content (Pagination) ---
  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center mt-4">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? tCommon("allItemsSelected")
            : `${selectedKeys.size} ${tCommon("of")} ${totalRoles} ${tCommon("selected")}`}
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
  }, [selectedKeys, roles.length, page, totalPages, totalRoles]);

  return (
    <div className="w-full">
      {topContent}

      {/* --- DESKTOP VIEW (TABLE) --- */}
      <div className="hidden xl:block">
        <Table
          isHeaderSticky
          aria-label="Roles List Table"
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
            emptyContent={t("noRolesFound")}
            isLoading={isLoading}
            items={roles}
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
      <div className="block xl:hidden">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Spinner size="lg" />
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center p-4 text-default-400">
            {t("noRolesFound")}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {roles.map((role) => {
              const isSelected =
                selectedKeys === "all" || selectedKeys.has(role.id.toString());

              return (
                <Card
                  key={role.id}
                  isPressable
                  className={`w-full transition-all ${
                    isSelected
                      ? "border-2 border-primary"
                      : "border-2 border-transparent"
                  }`}
                  onPress={() => handleCardSelection(role.id.toString())}
                >
                  <CardHeader className="justify-between items-start gap-3">
                    <div className="flex gap-3 items-center">
                      <div className="pointer-events-none">
                        <Checkbox isSelected={isSelected} />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-medium font-bold">
                          {role.denomination}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div onPointerDown={(e) => e.stopPropagation()}>
                        {renderActions(role)}
                      </div>
                      <Chip
                        color={role.enabled ? "success" : "danger"}
                        size="sm"
                        variant="flat"
                        className="mt-1"
                      >
                        {role.enabled ? t("enabled") : t("disabled")}
                      </Chip>
                    </div>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <div className="flex flex-col gap-2 text-small">
                      <div className="flex flex-col gap-1 mb-2">
                        <span className="text-default-500 font-semibold">
                          {t("description")}:
                        </span>
                        <span className="text-default-600 line-clamp-2">
                          {role.description || tCommon("noDescription")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-default-500 font-semibold">
                          {tCommon("createdAt")}:
                        </span>
                        <span>{utcToLocal(role.createdAt)}</span>
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
