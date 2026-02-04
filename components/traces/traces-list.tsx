"use client";

import { Selection, SortDescriptor } from "@heroui/react";
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
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Pagination,
  Spinner,
} from "@heroui/react";
import { IconEye, IconDotsVertical } from "@tabler/icons-react";

import { ITrace } from "@/interfaces/notification";
import { NotificationType } from "@/enums/notificationType";
import { utcToLocal } from "@/helpers/dateFormatter";
import { TraceAction } from "@/enums/traceAction";
import { tracesService } from "@/services/tracesService";

const INITIAL_VISIBLE_COLUMNS = [
  "description",
  "action",
  "ip",
  "createdAt",
  "actions",
];

export default function TracesList() {
  const locale = useLocale();

  const t = useTranslations("Traces");
  const tCommon = useTranslations("Common");

  const columns = [
    { name: t("description"), uid: "description", sortable: true },
    { name: t("action"), uid: "action", sortable: true },
    { name: t("ip"), uid: "ip", sortable: true },
    { name: tCommon("createdAt"), uid: "createdAt", sortable: true },
    { name: tCommon("actions"), uid: "actions" },
  ];

  const traceActions: Record<NotificationType, string> = {
    [TraceAction.Create]: t("actionValues.create"),
    [TraceAction.Update]: t("actionValues.update"),
    [TraceAction.Delete]: t("actionValues.delete"),
  };

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [visibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "createdAt",
    direction: "descending",
  });
  const [page, setPage] = useState(1);

  // Back-end data
  const [traces, setTraces] = useState<ITrace[]>([]);
  const [totalTraces, setTotalTraces] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users from the backend when debouncedFilter changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await tracesService.findAll(
        {
          pageSize: rowsPerPage,
          pageNumber: page,
          orderBy: sortDescriptor.column.toString(),
          desc: sortDescriptor.direction === "descending",
        },
        locale,
      );

      if (response?.ok) {
        const { items, count } = await response.json();

        setTraces(items);
        setTotalTraces(count);
      } else {
        setTraces([]);
        setTotalTraces(0);
      }
      setIsLoading(false);
    };

    void fetchData();
  }, [rowsPerPage, page, sortDescriptor, visibleColumns]);

  const notificationsSelected = useMemo(() => {
    if (selectedKeys === "all") {
      // Select all permissions
      return traces.map((notification) => notification.id);
    }
    // Otherwise, select only the checked ones

    return Array.from(selectedKeys) as string[];
  }, [selectedKeys, traces]);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  const renderCell = useCallback((trace: ITrace, columnKey: Key) => {
    const cellValue = trace[columnKey as keyof ITrace];

    switch (columnKey) {
      case "description":
        return (
          <p className="max-w-xs lg:max-w-2xl whitespace-nowrap text-small text-bold text-ellipsis overflow-hidden">
            {cellValue}
          </p>
        );
      case "action":
        return (
          <p className="text-bold text-small"> {traceActions[trace.action]}</p>
        );
      case "ip":
        return <p className="text-bold text-small"> {cellValue}</p>;
      case "createdAt":
        return (
          <p className="text-bold text-small">{utcToLocal(trace.createdAt)}</p>
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
                >
                  {tCommon("view")}
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

  const totalPages = Math.ceil(totalTraces / rowsPerPage) || 1;

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end gap-3 items-end" />
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total: {totalTraces} {t("traces")}
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
    totalTraces,
    hasSearchFilter,
    rowsPerPage,
    notificationsSelected,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? tCommon("allItemsSelected")
            : `${selectedKeys.size} ${tCommon("of")} ${totalTraces} ${tCommon("selected")}`}
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
  }, [selectedKeys, traces.length, page, totalPages]);

  return (
    <Table
      isHeaderSticky
      aria-label="Traces List"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px]",
      }}
      selectedKeys={selectedKeys}
      selectionMode="none"
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
        emptyContent={t("noTracesFound")}
        isLoading={isLoading}
        items={traces}
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
  );
}
