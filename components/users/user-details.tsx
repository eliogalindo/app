"use client";

import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Chip,
  ChipProps,
  Selection,
  Skeleton,
} from "@heroui/react";
import { useTranslations, useLocale } from "next-intl";
import { useParams } from "next/navigation";
import React, { Key, useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
  addToast,
  Divider,
} from "@heroui/react";

import defaultAvatar from "@/public/user.png";
import { useRouter } from "@/i18n/navigation";
import { title } from "@/components/primitives";
import { IRole } from "@/interfaces/role";
import { IUser } from "@/interfaces/user";
import { usersService } from "@/services/usersService";
import { API_URL } from "@/constants";
import { ColorType } from "@/types";

export default function UserDetails() {
  const router = useRouter();
  const locale = useLocale();
  const { userId } = useParams();
  const t = useTranslations("Users");
  const tRoles = useTranslations("Roles");
  const tCommon = useTranslations("Common");

  const columns = [
    {
      name: tRoles("denomination"),
      uid: "denomination",
      sortable: false,
    },
    { name: tRoles("description"), uid: "description", sortable: false },
  ];

  const statusColorMap: Record<number, ChipProps["color"]> = {
    0: "success",
    1: "danger",
    2: "warning",
  };

  const statusLabelMap: Record<number, string> = {
    0: t("statusValues.enabled"),
    1: t("statusValues.disabled"),
    2: t("statusValues.pending"),
  };
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  // Back-end data
  const [user, setUser] = useState<IUser>();
  const [roles, setRoles] = useState<IRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const renderCell = useCallback((role: IRole, columnKey: Key) => {
    const cellValue = role[columnKey as keyof IRole];

    switch (columnKey) {
      case "denomination":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">{cellValue}</p>
          </div>
        );
      case "description":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">{cellValue}</p>
          </div>
        );
      default:
        return cellValue as string;
    }
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      if (userId) {
        setIsLoading(true);
        const response = await usersService.findOne(userId.toString(), locale);

        if (response?.ok) {
          const user = await response?.json();

          setUser(user);
          if (user.roles.length) {
            setSelectedKeys(
              new Set(user?.roles.map((role: IRole) => role.id.toString())),
            );
          }
          setRoles(user?.roles);
        } else {
          const { detail } = await response?.json();

          toast("danger", detail);
        }
        setIsLoading(false);
      }
    };

    void fetchRole();
  }, [userId]);

  const toast = (color: ColorType, description: string) =>
    addToast({
      color: color,
      description: description,
      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col mt-2 gap-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total: {roles.length} {t("roles")}
          </span>
        </div>
      </div>
    );
  }, [roles.length]);
  const LoadingSkeleton = () => {
    return (
      <div className="w-full flex flex-row items-start gap-4">
        <div className="w-full max-w-75 flex flex-col items-start gap-6">
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-28 w-28 rounded-full" />
          </div>
        </div>
        <div className="w-full max-w-75 flex flex-col items-start gap-6">
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-4 w-2/5 rounded-lg" />
            <Skeleton className="h-3 w-4/5 rounded-lg" />
          </div>
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-4 w-2/5 rounded-lg" />
            <Skeleton className="h-3 w-4/5 rounded-lg" />
          </div>
        </div>
        <div className="w-full max-w-75 flex flex-col items-start gap-6">
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-4 w-2/5 rounded-lg" />
            <Skeleton className="h-3 w-4/5 rounded-lg" />
          </div>
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-4 w-2/5 rounded-lg" />
            <Skeleton className="h-3 w-4/5 rounded-lg" />
          </div>
        </div>
        <div className="w-full max-w-300px] flex flex-col items-start gap-6">
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-4 w-2/5 rounded-lg" />
            <Skeleton className="h-3 w-4/5 rounded-lg" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full py-8 md:py-10">
      <div className="mb-8">
        <h3 className={title({ size: "sm" })}>{tCommon("details")}</h3>
      </div>
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="w-full flex flex-col justify-between items-start text-center sm:flex-row sm:items-start sm:justify-start sm:text-start gap-4">
          <figure className="size-fit w-full flex justify-start">
            <Avatar
              alt="User profile image"
              className="h-28 w-28 rounded-full object-cover"
              data-testid="user-image"
              src={
                user?.avatar
                  ? `${API_URL}/uploads/${user?.avatar}`
                  : defaultAvatar.src
              }
              title="User profile image"
            />
          </figure>
          <div className="w-full flex flex-col items-start">
            <div className="w-full flex flex-col items-start">
              <h3 className="text-lg font-semibold">{t("fullName")}:</h3>
              <p className="text-default-600">{user?.fullName}</p>
            </div>
            <div className="w-full flex flex-col items-start">
              <h3 className="text-lg font-semibold">{t("username")}:</h3>
              <p className="text-default-600">{user?.username}</p>
            </div>
          </div>
          <div className="w-full flex flex-col items-start">
            <div className="w-full flex flex-col items-start">
              <h3 className="text-lg font-semibold">{t("email")}:</h3>
              <p className="text-default-600">{user?.email}</p>
            </div>
            <div className="w-full flex flex-col items-start">
              <h3 className="text-lg font-semibold">{t("phone")}:</h3>
              <p className="text-default-600">{user?.phone}</p>
            </div>
          </div>
          <div className="w-full flex flex-col items-start">
            <div>
              <h3 className="text-lg font-semibold">{t("status")}:</h3>
              <Chip
                color={statusColorMap[user?.status ?? 0]}
                size="sm"
                variant="flat"
              >
                {statusLabelMap[user?.status ?? 0]}
              </Chip>
            </div>
          </div>
        </div>
      )}
      <Divider className="my-2" />
      <h3 className="text-lg font-semibold">{t("roles")}</h3>
      <div className="w-full">
        {topContent}

        {/* --- DESKTOP VIEW (TABLE) --- */}
        <div className="hidden md:block">
          <Table
            isHeaderSticky
            aria-label="Roles List Table"
            classNames={{
              wrapper: "max-h-[382px]",
            }}
            selectedKeys={selectedKeys}
            selectionMode="none"
          >
            <TableHeader columns={columns}>
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
              emptyContent={tRoles("noRolesFound")}
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
        <div className="block md:hidden">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <Spinner size="lg" />
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center p-4 text-default-400">
              {tRoles("noRolesFound")}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {roles.map((role) => {
                return (
                  <Card
                    key={role.id}
                    isPressable
                    className="w-full transition-all border-2 border-transparent"
                  >
                    <CardHeader>
                      <p className="text-small font-bold">
                        {role.denomination}
                      </p>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                      <div className="flex flex-col gap-2 text-small">
                        <div className="flex flex-col gap-1 mb-2">
                          <span className="text-default-500 font-semibold">
                            {tRoles("description")}:
                          </span>
                          <span className="text-default-600 line-clamp-2">
                            {role.description || tCommon("noDescription")}
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Divider className="my-4" />
      <div className="w-full flex justify-end gap-3">
        <Button color="primary" onPress={router.back}>
          {tCommon("accept")}
        </Button>
      </div>
    </div>
  );
}
