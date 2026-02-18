"use client";

import {
  Selection,
  SortDescriptor,
  Switch,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Checkbox,
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
  IconListSearch,
} from "@tabler/icons-react";
import clsx from "clsx";

import DeleteConfirmationModal from "../modals/delete-confirmation";

import { ColorType } from "@/types";
import { INotification } from "@/interfaces/notification";
import { notificationsService } from "@/services/notificationsService";
import { NotificationType } from "@/enums/notificationType";
import { useNotificationStore } from "@/stores/notificationStore";
import { utcToLocal } from "@/helpers/dateFormatter";

export default function NotificationsList() {
  const locale = useLocale();
  const { notificationsSummary } = useNotificationStore();
  const t = useTranslations("Notifications");
  const tCommon = useTranslations("Common");

  const INITIAL_VISIBLE_COLUMNS = ["message", "type", "createdAt", "actions"];

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
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS),
  );
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "createdAt",
    direction: "descending",
  });
  const [page, setPage] = useState(1);

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [debouncedFilter, setDebouncedFilter] = useState(filterValue);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [includeRead, setIncludeRead] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedFilter(filterValue), 400);
    return () => clearTimeout(handler);
  }, [filterValue]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const response = await notificationsService.findAll(
        {
          pageSize: rowsPerPage,
          pageNumber: page,
          orderBy: sortDescriptor.column.toString(),
          desc: sortDescriptor.direction === "descending",
          filter: debouncedFilter,
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
    debouncedFilter,
    refresh,
    includeRead,
    notificationsSummary,
    locale,
  ]);

  const notificationsSelected = useMemo(() => {
    if (selectedKeys === "all") return notifications.map((n) => n.id);
    return Array.from(selectedKeys) as string[];
  }, [selectedKeys, notifications]);

  const onMarkAsRead = async (id: string) => {
    const result = await notificationsService.markAsRead(id, locale);
    if (result?.ok) toast("success", t("messages.markAsReadSuccess"));
    else {
      const { detail } = await result?.json();
      toast("danger", detail);
    }
  };

  const onMarkAllAsRead = async () => {
    const result = await notificationsService.markAllAsRead(locale);
    if (result?.ok) toast("success", t("messages.markAllAsReadSuccess"));
    else {
      const { detail } = await result?.json();
      toast("danger", detail);
    }
  };

  const onDelete = async () => {
    setIsDeleting(true);
    const response =
      notificationsSelected.length === 1
        ? await notificationsService.delete(notificationsSelected[0])
        : await notificationsService.deleteMany(notificationsSelected);

    if (response?.ok) {
      toast(
        "success",
        notificationsSelected.length === 1
          ? t("messages.deleteSuccess")
          : t("messages.deleteManySuccess"),
      );
      setSelectedKeys(new Set());
      setRefresh((prev) => !prev);
      onOpenChange();
    } else {
      toast(
        "danger",
        notificationsSelected.length === 1
          ? t("messages.deleteError")
          : t("messages.deleteManyError"),
      );
    }
    setIsDeleting(false);
  };

  const toast = (color: ColorType, description: string) =>
    addToast({
      color,
      description,
      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((col) =>
      Array.from(visibleColumns).includes(col.uid),
    );
  }, [visibleColumns]);

  const handleCardSelection = (id: string) => {
    setSelectedKeys((prev) => {
      const currentKeys = new Set(
        prev === "all" ? notifications.map((n) => n.id.toString()) : prev,
      );
      if (currentKeys.has(id)) currentKeys.delete(id);
      else currentKeys.add(id);
      return new Set(currentKeys);
    });
  };

  const renderActions = (notification: INotification) => (
    <Dropdown backdrop="transparent">
      <DropdownTrigger>
        <Button isIconOnly size="sm" variant="light">
          <IconDotsVertical className="text-default-300" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Actions">
        <DropdownItem key="view" startContent={<IconEye size={20} />}>
          {tCommon("view")}
        </DropdownItem>
        <DropdownItem
          key="markAsRead"
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
  );

  const renderCell = useCallback(
    (notification: INotification, columnKey: Key) => {
      const cellValue = notification[columnKey as keyof INotification];
      const textClass = clsx("text-small", {
        "text-bold": notification.isRead,
        "font-extrabold": !notification.isRead,
      });

      switch (columnKey) {
        case "message":
          return (
            <p
              className={clsx(
                "max-w-xs lg:max-w-2xl whitespace-nowrap overflow-hidden text-ellipsis",
                textClass,
              )}
            >
              {cellValue}
            </p>
          );
        case "type":
          return (
            <p className={textClass}>
              {notificationTypeValues[notification.type]}
            </p>
          );
        case "createdAt":
          return (
            <p className={textClass}>{utcToLocal(notification.createdAt)}</p>
          );
        case "actions":
          return (
            <div className="flex justify-end items-center">
              {renderActions(notification)}
            </div>
          );
        default:
          return cellValue;
      }
    },
    [notificationTypeValues, tCommon, t],
  );

  const onNextPage = useCallback(() => setPage((prev) => prev + 1), []);
  const onPreviousPage = useCallback(
    () => setPage((prev) => Math.max(prev - 1, 1)),
    [],
  );
  const onRowsPerPageChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    [],
  );

  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col items-center gap-3 w-full sm:flex-row sm:items-center sm:justify-end">
          <Switch
            isSelected={includeRead}
            onChange={() => setIncludeRead(!includeRead)}
            className="w-full sm:w-auto"
          >
            {t("includeRead")}
          </Switch>
          {notificationsSelected.length > 0 && (
            <Button
              color="danger"
              endContent={<IconTrash size="20" />}
              variant="flat"
              onPress={onOpen}
              className="w-full sm:w-auto"
            >
              {tCommon("delete")} ({notificationsSelected.length})
            </Button>
          )}
          <Button
            color="primary"
            endContent={<IconCopyCheck size="20" />}
            onPress={onMarkAllAsRead}
            className="w-full sm:w-auto"
          >
            {t("markAllAsRead")}
          </Button>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {totalNotifications} {t("notifications")}
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
    ),
    [
      filterValue,
      includeRead,
      notificationsSelected.length,
      totalNotifications,
      rowsPerPage,
      t,
      tCommon,
      onRowsPerPageChange,
      onMarkAllAsRead,
      onOpen,
    ],
  );

  const bottomContent = useMemo(
    () => (
      <div className="py-2 px-2 flex justify-between items-center mt-4">
        <span className="w-[30%] text-small text-default-400" />
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={Math.ceil(totalNotifications / rowsPerPage) || 1}
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
            isDisabled={
              page === (Math.ceil(totalNotifications / rowsPerPage) || 1)
            }
            size="sm"
            variant="flat"
            onPress={onNextPage}
          >
            {tCommon("next")}
          </Button>
        </div>
      </div>
    ),
    [
      page,
      totalNotifications,
      rowsPerPage,
      onPreviousPage,
      onNextPage,
      tCommon,
    ],
  );

  return (
    <div className="w-full">
      {topContent}

      {/* DESKTOP VIEW */}
      <div className="hidden md:block">
        <Table
          isHeaderSticky
          aria-label="Notifications Table"
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          sortDescriptor={sortDescriptor}
          onSelectionChange={setSelectedKeys}
          onSortChange={setSortDescriptor}
          classNames={{ wrapper: "max-h-[382px]" }}
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
      </div>

      {/* MOBILE VIEW */}
      <div className="block md:hidden">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Spinner size="lg" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-4 text-default-400">
            {t("noNotificationsFound")}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* HEADER: SELECT ALL */}
            <div className="flex justify-between items-center px-2">
              <Checkbox
                isSelected={
                  selectedKeys === "all" ||
                  (selectedKeys.size === notifications.length &&
                    notifications.length > 0)
                }
                onValueChange={(isSelected) =>
                  setSelectedKeys(isSelected ? "all" : new Set())
                }
              >
                <span className="text-small text-default-500">
                  {tCommon("selectAll")}
                </span>
              </Checkbox>
            </div>
            {notifications.map((notification) => {
              const isSelected =
                selectedKeys === "all" ||
                selectedKeys.has(notification.id.toString());
              return (
                <Card
                  key={notification.id}
                  isPressable
                  className={`w-full transition-all ${
                    isSelected
                      ? "border-2 border-primary"
                      : "border-2 border-transparent"
                  }`}
                  onPress={() =>
                    handleCardSelection(notification.id.toString())
                  }
                >
                  <CardHeader className="justify-between items-start gap-3">
                    <div className="flex gap-3 items-start w-full">
                      <div className="pointer-events-none">
                        <Checkbox isSelected={isSelected} />
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <p
                          className={clsx("text-small line-clamp-2", {
                            "text-bold": notification.isRead,
                            "font-extrabold": !notification.isRead,
                          })}
                        >
                          {notification.message}
                        </p>
                        <p className="text-tiny text-default-400">
                          {notificationTypeValues[notification.type]}
                        </p>
                      </div>
                      {renderActions(notification)}
                    </div>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <div className="flex justify-between text-small">
                      <span className="text-default-500 font-semibold">
                        {tCommon("createdAt")}:
                      </span>
                      <span
                        className={
                          notification.isRead ? "text-bold" : "font-extrabold"
                        }
                      >
                        {utcToLocal(notification.createdAt)}
                      </span>
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
