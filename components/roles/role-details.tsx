"use client";

import {
  Card,
  CardBody,
  CardHeader,
  Chip,
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

import { useRouter } from "@/i18n/navigation";
import { IPermission } from "@/interfaces/permission";
import { rolesService } from "@/services/rolesService";
import { title } from "@/components/primitives";
import { IRole } from "@/interfaces/role";
import { ColorType } from "@/types";

export default function RoleDetails() {
  const router = useRouter();
  const locale = useLocale();
  const { roleId } = useParams();
  const t = useTranslations("Roles");
  const tPermissions = useTranslations("Permissions");
  const tCommon = useTranslations("Common");

  const columns = [
    {
      name: tPermissions("denomination"),
      uid: "denomination",
      sortable: false,
    },
    { name: tPermissions("description"), uid: "description", sortable: false },
    { name: tPermissions("group"), uid: "group", sortable: false },
    { name: tPermissions("action"), uid: "action", sortable: false },
  ];

  const group: Record<number, string> = {
    0: tPermissions("groupValues.administrative"),
    1: tPermissions("groupValues.standard"),
  };
  const action: Record<number, string> = {
    0: tPermissions("actionValues.read"),
    1: tPermissions("actionValues.write"),
    2: tPermissions("actionValues.delete"),
  };

  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  // Back-end data
  const [role, setRole] = useState<IRole>();
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getTranslation = useCallback(
    (permission: IPermission) => {
      const [translation] = permission.translations;

      return translation;
    },
    [permissions],
  );

  const renderCell = useCallback((permission: IPermission, columnKey: Key) => {
    const cellValue = permission[columnKey as keyof IPermission];
    const translation = getTranslation(permission);

    switch (columnKey) {
      case "denomination":
        return (
          <p className="max-w-xs lg:max-w-sm whitespace-nowrap text-small overflow-hidden text-ellipsis text-bold">
            {translation?.denomination}
          </p>
        );
      case "description":
        return (
          <p className="max-w-xs lg:max-w-sm whitespace-nowrap text-small overflow-hidden text-ellipsis text-bold">
            {translation?.description}
          </p>
        );
      case "group":
        return (
          <p className="text-bold text-small">{group[permission.group]}</p>
        );
      case "action":
        return (
          <p className="text-bold text-small">{action[permission.action]}</p>
        );
      default:
        return cellValue as string;
    }
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      if (roleId) {
        setIsLoading(true);
        const response = await rolesService.findOne(roleId.toString(), locale);

        if (response?.ok) {
          const role = await response?.json();

          setRole(role);
          if (role.permissions.length) {
            setSelectedKeys(
              new Set(
                role?.permissions.map((e: IPermission) => e.id.toString()),
              ),
            );
          }
          setPermissions(role?.permissions);
        } else {
          toast("danger", t("messages.fetchError"));
        }
        setIsLoading(false);
      }
    };

    void fetchRole();
  }, [roleId]);

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
            Total: {permissions.length} {t("permissions")}
          </span>
        </div>
      </div>
    );
  }, [permissions.length]);

  const LoadingSkeleton = () => {
    return (
      <div className="w-full flex flex-row items-start gap-4">
        <div className="w-full max-w-100 flex flex-col items-start gap-6">
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-4 w-2/5 rounded-lg" />
            <Skeleton className="h-3 w-4/5 rounded-lg" />
          </div>
        </div>
        <div className="w-full max-w-100 flex flex-col items-start gap-6">
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-4 w-2/5 rounded-lg" />
            <Skeleton className="h-3 w-4/5 rounded-lg" />
          </div>
        </div>
        <div className="w-full max-w-100 flex flex-col items-start gap-6">
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-4 w-2/5 rounded-lg" />
            <Skeleton className="h-4 w-1/12 rounded-lg" />
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
        <div className="w-full flex flex-col justify-start items-start sm:flex-row sm:items-start sm:justify-start sm:text-start gap-4">
          <div className="w-full flex flex-col">
            <div>
              <h3 className="text-lg font-semibold">{t("denomination")}:</h3>
              <p className="text-default-600">{role?.denomination}</p>
            </div>
          </div>
          <div className="w-full flex flex-col items-start">
            <div>
              <h3 className="text-lg font-semibold">{t("description")}:</h3>
              <p className="text-default-600">{role?.description}</p>
            </div>
          </div>
          <div className="w-full flex flex-col">
            <div>
              <h3 className="text-lg font-semibold">{t("enabled")}:</h3>
              <Chip
                color={role?.enabled ? "success" : "danger"}
                size="md"
                variant="flat"
              >
                {role?.enabled ? tCommon("yes") : tCommon("no")}
              </Chip>
            </div>
          </div>
        </div>
      )}
      <Divider className="my-2" />
      <h3 className="text-lg font-semibold">{t("permissions")}</h3>
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
              emptyContent={tPermissions("noPermissionsFound")}
              isLoading={isLoading}
              items={permissions}
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
          ) : permissions.length === 0 ? (
            <div className="text-center p-4 text-default-400">
              {t("noRolesFound")}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {permissions.map((permission) => {
                const isSelected =
                  selectedKeys === "all" ||
                  selectedKeys.has(permission.id.toString());

                return (
                  <Card
                    key={permission.id}
                    className="w-full transition-all border-2 border-transparent"
                  >
                    <CardHeader>
                      <p className="text-medium font-bold">
                        {getTranslation(permission)?.denomination}
                      </p>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                      <div className="flex flex-col text-small">
                        <div className="flex justify-between gap-2">
                          <span className="text-default-500 font-semibold">
                            {t("description")}:
                          </span>
                          <span className="text-default-600 line-clamp-2">
                            {getTranslation(permission)?.denomination ||
                              tCommon("noDescription")}
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
