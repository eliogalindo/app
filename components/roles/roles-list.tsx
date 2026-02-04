"use client";

import type { Selection, SortDescriptor } from "@heroui/react";

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
  Pagination,
  Spinner,
  addToast,
  useDisclosure,
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

import DeleteConfirmationModal from "../modals/delete-confirmation";

import { useRouter, usePathname } from "@/i18n/navigation";
import { IRole } from "@/interfaces/role";
import { rolesService } from "@/services/rolesService";
import { ColorType } from "@/types";
import { utcToLocal } from "@/helpers/dateFormatter";

const INITIAL_VISIBLE_COLUMNS = [
  "denomination",
  "description",
  "enabled",
  "createdAt",
  "actions",
];

export default function RolesList() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Roles");
  const tCommon = useTranslations("Common");

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
      const response = await rolesService.findAll(
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
    debouncedFilter, // use debounced value here
    visibleColumns,
    refresh,
  ]);

  const rolesSelected = useMemo(() => {
    if (selectedKeys === "all") {
      // Select all permissions
      return roles.map((role) => role.id);
    }
    // Otherwise, select only the checked ones

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
        setRefresh((prev) => !prev); // Trigger a refresh
        onOpenChange();
      } else {
        toast("danger", t("messages.deleteError"));
      }
    } else {
      const response = await rolesService.deleteMany(rolesSelected);

      if (response?.ok) {
        toast("success", t("messages.deleteManySuccess"));
        setSelectedKeys(new Set());
        setRefresh((prev) => !prev); // Trigger a refresh
        onOpenChange();
      } else {
        toast("danger", t("messages.deleteManyError"));
      }
    }
    setIsDeleting(false);
  };

  const toast = (color: ColorType, description: string) =>
    addToast({
      color: color,
      description: description,
      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const renderCell = useCallback((role: IRole, columnKey: Key) => {
    const cellValue = role[columnKey as keyof IRole];

    switch (columnKey) {
      case "denomination":
        return (
          <p className="max-w-xs lg:max-w-sm whitespace-nowrap text-small overflow-hidden text-ellipsis text-bold">
            {cellValue}
          </p>
        );
      case "description":
        return (
          <p className="max-w-xs lg:max-w-sm whitespace-nowrap text-small overflow-hidden text-ellipsis text-bold">
            {cellValue}
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

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            aria-label="search"
            className="w-full sm:max-w-[44%]"
            placeholder={t("searchPlaceholder")}
            startContent={<IconListSearch stroke={1} />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            {rolesSelected.length > 1 && (
              <Button
                color="danger"
                endContent={<IconTrash size="20" />}
                variant="flat"
                onPress={onOpen}
              >
                {tCommon("delete")}
              </Button>
            )}
            <Dropdown aria-label="search">
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
    hasSearchFilter,
    rowsPerPage,
    rolesSelected,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
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
  }, [selectedKeys, roles.length, page, totalPages]);

  return (
    <>
      <Table
        isHeaderSticky
        aria-label="Roles List"
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
