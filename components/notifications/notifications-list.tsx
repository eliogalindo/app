"use client";

import { Selection, SortDescriptor, Switch } from "@heroui/react";
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
  addToast,
  useDisclosure,
} from "@heroui/react";
import {
  IconEye,
  IconTrash,
  IconDotsVertical,
  IconSquareCheck,
  IconCopyCheck,
} from "@tabler/icons-react";
import clsx from "clsx";

import DeleteConfirmationModal from "../modals/delete-confirmation";

import { ColorType } from "@/types";
import { INotification } from "@/interfaces/notification";
import { notificationsService } from "@/services/notificationsService";
import { NotificationType } from "@/enums/notificationType";
import { useNotificationStore } from "@/stores/notificationStore";
import { utcToLocal } from "@/helpers/dateFormatter";

const INITIAL_VISIBLE_COLUMNS = ["message", "type", "createdAt", "actions"];

export default function NotificationsList() {
  const locale = useLocale();
  const { notificationsSummary } = useNotificationStore();

  const t = useTranslations("Notifications");
  const tCommon = useTranslations("Common");

  const columns = [
    { name: t("message"), uid: "message", sortable: true },
    { name: t("type"), uid: "type", sortable: true },
    { name: tCommon("createdAt"), uid: "createdAt", sortable: true },
    { name: tCommon("actions"), uid: "actions" },
  ];

  const notificationTypeValues: Record<NotificationType, string> = {
    [NotificationType.Default]: t("typeValues.default"),
    [NotificationType.Info]: t("typeValues.info"),
    [NotificationType.System]: t("typeValues.system"),
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
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [debouncedFilter, setDebouncedFilter] = useState(filterValue);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [includeRead, setIncludeRead] = useState(true);
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
      const response = await notificationsService.findAll(
        {
          pageSize: rowsPerPage,
          pageNumber: page,
          orderBy: sortDescriptor.column.toString(),
          desc: sortDescriptor.direction === "descending",
          filter: debouncedFilter, // use debounced value here
          includeRead: includeRead,
        },
        locale,
      );

      if (response?.ok) {
        const { items, count } = await response.json();

        setNotifications(items);
        setTotalNotifications(count);
      } else {
        setNotifications([]);
        setTotalNotifications(0);

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
    includeRead,
    notificationsSummary,
  ]);

  const notificationsSelected = useMemo(() => {
    if (selectedKeys === "all") {
      // Select all permissions
      return notifications.map((notification) => notification.id);
    }
    // Otherwise, select only the checked ones

    return Array.from(selectedKeys) as string[];
  }, [selectedKeys, notifications]);

  const onMarkAsRead = async (id: string) => {
    const result = await notificationsService.markAsRead(id, locale);

    if (result?.ok) {
      toast("success", t("messages.markAsReadSuccess"));
    } else {
      const { detail } = await result?.json();

      toast("danger", detail);
    }
  };
  const onMarkAllAsRead = async () => {
    const result = await notificationsService.markAllAsRead(locale);

    if (result?.ok) {
      toast("success", t("messages.markAllAsReadSuccess"));
    } else {
      const { detail } = await result?.json();

      toast("danger", detail);
    }
  };

  const onDelete = async () => {
    setIsDeleting(true);
    if (notificationsSelected.length === 1) {
      const [id] = notificationsSelected;
      const response = await notificationsService.delete(id);

      if (response?.ok) {
        toast("success", t("messages.deleteSuccess"));
        setSelectedKeys(new Set());
        setRefresh((prev) => !prev); // Trigger a refresh
        onOpenChange();
      } else {
        toast("danger", t("messages.deleteError"));
      }
    } else {
      const response = await notificationsService.deleteMany(
        notificationsSelected,
      );

      if (response?.ok) {
        toast("success", t("messages.deleteManySuccess"));
        setSelectedKeys(new Set());
        setRefresh((prev) => !prev); // Triggers a refresh
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

  const renderCell = useCallback(
    (notification: INotification, columnKey: Key) => {
      const cellValue = notification[columnKey as keyof INotification];

      switch (columnKey) {
        case "message":
          return (
            <p
              className={clsx(
                "max-w-xs lg:max-w-2xl whitespace-nowrap text-small overflow-hidden text-ellipsis",
                {
                  "text-bold ": notification.isRead,
                  "font-extrabold": !notification.isRead,
                },
              )}
            >
              {cellValue}
            </p>
          );
        case "type":
          return (
            <p
              className={clsx("text-small", {
                "text-bold ": notification.isRead,
                "font-extrabold": !notification.isRead,
              })}
            >
              {notificationTypeValues[notification.type]}
            </p>
          );
        case "createdAt":
          return (
            <p
              className={clsx("text-small", {
                "text-bold ": notification.isRead,
                "font-extrabold": !notification.isRead,
              })}
            >
              {utcToLocal(notification.createdAt)}
            </p>
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
                  <DropdownItem
                    key="markAsRead"
                    description={t("actionDescriptions.markAsRead")}
                    isDisabled={notification.isRead}
                    startContent={<IconSquareCheck size={20} />}
                    onPress={() => onMarkAsRead(notification.id.toString())}
                  >
                    {t("markAsRead")}
                  </DropdownItem>
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    description={t("actionDescriptions.deleteDescription")}
                    startContent={<IconTrash size={20} />}
                    onPress={() => {
                      setSelectedKeys(new Set([notification.id.toString()]));
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
    },
    [],
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

  const onSearchChange = useCallback((value?: string) => {
    setFilterValue(value || "");
    setPage(1);
  }, []);

  const totalPages = Math.ceil(totalNotifications / rowsPerPage) || 1;

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end gap-3 items-end">
          <div className="flex gap-3">
            <Switch
              id="icludeRead"
              isSelected={includeRead}
              name="icludeRead"
              onChange={() => setIncludeRead((prevState) => !prevState)}
            >
              {t("includeRead")}
            </Switch>
            {notificationsSelected.length > 1 && (
              <Button
                color="danger"
                endContent={<IconTrash size="20" />}
                variant="flat"
                onPress={onOpen}
              >
                {tCommon("delete")}
              </Button>
            )}
            <Button
              color="primary"
              endContent={<IconCopyCheck />}
              isDisabled={notifications.every((n) => n.isRead)}
              onPress={() => onMarkAllAsRead()}
            >
              {t("markAllAsRead")}
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total: {totalNotifications} {t("notifications")}
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
    totalNotifications,
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
            : `${selectedKeys.size} ${tCommon("of")} ${totalNotifications} ${tCommon("selected")}`}
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
  }, [selectedKeys, notifications.length, page, totalPages]);

  return (
    <>
      <Table
        isHeaderSticky
        aria-label="Notifications List"
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
          emptyContent={t("noNotificationsFound")}
          isLoading={isLoading}
          items={notifications}
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
