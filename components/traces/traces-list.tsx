"use client";

import {
  Selection,
  SortDescriptor,
  Card,
  CardHeader,
  CardBody,
  Divider,
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
import { utcToLocal } from "@/helpers/dateFormatter";
import { TraceAction } from "@/enums/traceAction";
import { tracesService } from "@/services/tracesService";

export default function TracesList() {
  const locale = useLocale();
  const t = useTranslations("Traces");
  const tCommon = useTranslations("Common");

  const INITIAL_VISIBLE_COLUMNS = [
    "description",
    "action",
    "ip",
    "createdAt",
    "actions",
  ];

  const columns = [
    { name: t("description"), uid: "description", sortable: true },
    { name: t("action"), uid: "action", sortable: true },
    { name: t("ip"), uid: "ip", sortable: true },
    { name: tCommon("createdAt"), uid: "createdAt", sortable: true },
    { name: tCommon("actions"), uid: "actions" },
  ];

  const traceActions: Record<string, string> = {
    [TraceAction.Create]: t("actionValues.create"),
    [TraceAction.Update]: t("actionValues.update"),
    [TraceAction.Delete]: t("actionValues.delete"),
  };

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
  }, [rowsPerPage, page, sortDescriptor, locale]);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid),
    );
  }, [visibleColumns]);

  // Reusable Actions Menu
  const renderActions = (trace: ITrace) => (
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
  );

  const renderCell = useCallback(
    (trace: ITrace, columnKey: Key) => {
      const cellValue = trace[columnKey as keyof ITrace];

      switch (columnKey) {
        case "description":
          return (
            <p className="max-w-xs lg:max-w-lg whitespace-nowrap text-small text-bold text-ellipsis overflow-hidden">
              {cellValue}
            </p>
          );
        case "action":
          return (
            <p className="text-bold text-small capitalize">
              {traceActions[trace.action]}
            </p>
          );
        case "ip":
          return <p className="text-bold text-small">{cellValue}</p>;
        case "createdAt":
          return (
            <p className="text-bold text-small">
              {utcToLocal(trace.createdAt)}
            </p>
          );
        case "actions":
          return (
            <div className="relative flex justify-end items-center gap-2">
              {renderActions(trace)}
            </div>
          );
        default:
          return cellValue;
      }
    },
    [traceActions, tCommon],
  );

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

  const totalPages = Math.ceil(totalTraces / rowsPerPage) || 1;

  // --- Top Content (Responsive structure like Users/Roles) ---
  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4 mb-4">
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
  }, [totalTraces, rowsPerPage, onRowsPerPageChange, t, tCommon]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center mt-4">
        <span className="w-[30%] text-small text-default-400" />
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
  }, [page, totalPages, onPreviousPage, onNextPage, tCommon]);

  return (
    <div className="w-full">
      {topContent}

      {/* --- DESKTOP VIEW (TABLE) --- */}
      <div className="hidden xl:block">
        <Table
          isHeaderSticky
          aria-label="Traces List Table"
          classNames={{
            wrapper: "max-h-[382px]",
          }}
          sortDescriptor={sortDescriptor}
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
      </div>

      {/* --- MOBILE VIEW (CARDS) --- */}
      <div className="block xl:hidden">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Spinner size="lg" />
          </div>
        ) : traces.length === 0 ? (
          <div className="text-center p-4 text-default-400">
            {t("noTracesFound")}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {traces.map((trace) => (
              <Card
                key={trace.id}
                className="w-full border-2 border-transparent transition-all"
              >
                <CardHeader>
                  <div className="flex w-full justify-between items-center text-small">
                    <p className="font-bold line-clamp-2">
                      {trace.description}
                    </p>
                    <div onPointerDown={(e) => e.stopPropagation()}>
                      {renderActions(trace)}
                    </div>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <div className="flex flex-col text-small">
                    <div className="flex justify-between gap-2">
                      <span className="text-default-500 font-semibold">
                        {t("ip")}:
                      </span>
                      <span className="text-default-600">{trace.ip}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-default-500 font-semibold">
                        {t("action")}:
                      </span>
                      <span className="text-default-600">
                        {traceActions[trace.action]}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-default-500 font-semibold">
                        {tCommon("createdAt")}:
                      </span>
                      <span className="text-default-600">
                        {utcToLocal(trace.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {bottomContent}
    </div>
  );
}
