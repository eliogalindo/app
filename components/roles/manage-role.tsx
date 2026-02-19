"use client";

import type { Selection, SortDescriptor } from "@heroui/react";

import { useTranslations, useLocale } from "next-intl";
import { useParams } from "next/navigation";
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
  Pagination,
  Spinner,
  Form,
  Divider,
  Switch,
  Card,
  CardHeader,
  Checkbox,
  CardBody,
} from "@heroui/react";
import { useFormik } from "formik";
import { IconListSearch } from "@tabler/icons-react";

import showToast from "@/components/ui/toast";

import { useRouter } from "@/i18n/navigation";
import { permissionsService } from "@/services/permissionsService";
import { IPermission } from "@/interfaces/permission";
import { IRoleFormData } from "@/interfaces/role";
import { rolesService } from "@/services/rolesService";
import { RoleSchema } from "@/schemas/role";
import { title } from "@/components/primitives";

export default function ManageRole() {
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
    { name: tPermissions("group"), uid: "group", sortable: true },
    { name: tPermissions("action"), uid: "action", sortable: true },
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

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "group",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  // Back-end data
  const [permissions, setPermissions] = useState<IPermission[]>([]);
  const [totalPermissions, setTotalPermissions] = useState(0);
  const [debouncedFilter, setDebouncedFilter] = useState(filterValue);
  const [isLoading, setIsLoading] = useState(true);

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
      const response = await permissionsService.findAll(
        {
          pageSize: rowsPerPage,
          pageNumber: page,
          orderBy: sortDescriptor.column.toString(),
          desc: sortDescriptor.direction === "descending",
          filter: debouncedFilter, // use debounced value here
          allSelected: selectedKeys === "all",
        },
        locale,
      );

      if (response?.ok) {
        const { items, count } = await response.json();

        setPermissions(items);
        setTotalPermissions(count);
      } else {
        setPermissions([]);
        setTotalPermissions(0);
        showToast("danger", t("messages.fetchError"));
      }
      setIsLoading(false);
    };

    void fetchData();
  }, [
    rowsPerPage,
    page,
    sortDescriptor,
    debouncedFilter, // use debounced value here
  ]);

  const hasSearchFilter = Boolean(filterValue);

  const getTranslation = useCallback(
    (permission: IPermission) => {
      const [translation] = permission.translations;

      return translation;
    },
    [permissions],
  );

  // --- Helpers for Mobile/Card View ---

  const handleCardSelection = (id: string) => {
    setSelectedKeys((prev) => {
      const currentKeys = new Set(
        prev === "all" ? permissions.map((r) => r.id.toString()) : prev,
      );

      if (currentKeys.has(id)) {
        currentKeys.delete(id);
      } else {
        currentKeys.add(id);
      }

      return new Set(currentKeys);
    });
  };

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
          <div className="flex flex-col">
            <p className="text-bold text-small">{group[permission.group]}</p>
          </div>
        );
      case "action":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">{action[permission.action]}</p>
          </div>
        );
      default:
        return cellValue as string;
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

  const totalPages = Math.ceil(totalPermissions / rowsPerPage) || 1;

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            autoComplete="on"
            className="w-full sm:max-w-[44%]"
            id="search"
            placeholder={tPermissions("searchPlaceholder")}
            startContent={<IconListSearch stroke={1} />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total: {totalPermissions} {t("permissions")}
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
    onSearchChange,
    onRowsPerPageChange,
    totalPermissions,
    hasSearchFilter,
    rowsPerPage,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? tCommon("allItemsSelected")
            : `${selectedKeys.size} ${tCommon("of")} ${totalPermissions} ${tCommon("selected")}`}
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
  }, [selectedKeys, permissions.length, page, totalPages]);

  const selectedPermissionIds = useMemo(() => {
    if (selectedKeys === "all") {
      // Select all permissions
      return permissions.map((permission) => permission.id);
    }
    // Otherwise, select only the checked ones

    return Array.from(selectedKeys) as string[];
  }, [selectedKeys, permissions]);

  useEffect(() => {
    // Update the form values with the selected permissions
    if (selectedPermissionIds.length > 0) {
      setFieldValue("permissions", selectedPermissionIds);
    } else {
      setFieldValue("permissions", []);
    }
  }, [selectedPermissionIds]);

  const onSubmit = async (data: IRoleFormData) => {
    if (roleId) {
      const response = await rolesService.update(
        roleId.toString(),
        data,
        {
          filter: debouncedFilter, // use debounced value here
          allSelected: selectedKeys === "all",
        },
        locale,
      );

      if (response?.status === 200) {
        showToast("success", t("messages.updateSuccess"));
        router.push("/admin/roles");
      } else {
        const { detail } = await response?.json();

        showToast("danger", detail);
      }
    } else {
      const response = await rolesService.create(
        data,
        {
          filter: debouncedFilter, // use debounced value here
          allSelected: selectedKeys === "all",
        },
        locale,
      );

      if (response?.status === 200) {
        showToast("success", t("messages.createSuccess"));
        router.push("/admin/roles");
      } else {
        const { detail } = await response?.json();

        showToast("danger", detail);
      }
    }
  };

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    setFieldValue,
    setValues,
  } = useFormik({
    initialValues: {
      denomination: "",
      description: "",
      enabled: false,
      permissions: [], // This will be filled later with selected permissions
    },
    validationSchema: RoleSchema(t),
    onSubmit: onSubmit,
  });

  useEffect(() => {
    const fetchRole = async () => {
      if (roleId) {
        const response = await rolesService.findOne(roleId.toString(), locale);

        if (response?.ok) {
          const role = await response?.json();

          if (role.permissions.length) {
            setSelectedKeys(
              new Set(
                role?.permissions.map(
                  (permission: IPermission) => permission.id.toString(),
                  locale,
                ),
              ),
            );
          }
          void setValues(role);
        } else {
          const { detail } = await response?.json();

          showToast("danger", detail);
        }
      }
    };

    void fetchRole();
  }, [roleId]);

  useEffect(() => {
    if (errors.permissions && isSubmitting) {
      showToast("danger", t("messages.permissionsRequired"));
    }
  }, [errors.permissions, isSubmitting]);

  return (
    <div className="w-full py-8 md:py-10">
      <div className="mb-8">
        <h3
          className={title({ size: "sm" })}
        >{`${roleId ? tCommon("edit") : tCommon("add")} ${t("role")}`}</h3>
      </div>
      <Form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          isRequired
          autoComplete="on"
          errorMessage={errors.denomination}
          id="denomination"
          isInvalid={!!errors.denomination && touched.denomination}
          label={t("denomination")}
          labelPlacement="outside"
          name="denomination"
          placeholder={t("denominationPlaceholder")}
          type="text"
          value={values.denomination}
          onBlur={handleBlur}
          onChange={handleChange}
        />
        <Input
          isRequired
          autoComplete="on"
          errorMessage={errors.description}
          id="description"
          isInvalid={!!errors.description && touched.description}
          label={t("description")}
          labelPlacement="outside"
          name="description"
          placeholder={t("descriptionPlaceholder")}
          type="text"
          value={values.description}
          onBlur={handleBlur}
          onChange={handleChange}
        />
        <Switch
          id="enabled"
          isSelected={values.enabled}
          name="enabled"
          onBlur={handleBlur}
          onChange={handleChange}
        >
          {t("enabled")}
        </Switch>
        <Divider className="my-2" />
        <h3 className="text-lg font-semibold">{t("permissions")}</h3>{" "}
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
                {/* HEADER: SELECT ALL */}
                <div className="flex justify-between items-center px-2">
                  <Checkbox
                    isSelected={
                      selectedKeys === "all" ||
                      (selectedKeys.size === permissions.length &&
                        permissions.length > 0)
                    }
                    onValueChange={(isSelected) =>
                      setSelectedKeys(isSelected ? "all" : new Set())
                    }
                  >
                    <span className="text-small text-default-500">
                      {tCommon("selectAll")}
                    </span>
                  </Checkbox>
                  <span className="text-tiny text-default-400">
                    {selectedKeys === "all"
                      ? totalPermissions
                      : selectedKeys.size}{" "}
                    {tCommon("selected")}
                  </span>
                </div>
                {permissions.map((permission) => {
                  const isSelected =
                    selectedKeys === "all" ||
                    selectedKeys.has(permission.id.toString());

                  return (
                    <Card
                      key={permission.id}
                      isPressable
                      className={`w-full transition-all ${
                        isSelected
                          ? "border-2 border-primary"
                          : "border-2 border-transparent"
                      }`}
                      onPress={() =>
                        handleCardSelection(permission.id.toString())
                      }
                    >
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div className="pointer-events-none">
                            <Checkbox isSelected={isSelected} />
                          </div>
                          <p className="text-medium font-bold">
                            {getTranslation(permission)?.denomination}
                          </p>
                        </div>
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

          {bottomContent}
        </div>
        <Divider className="my-2" />
        <div className="w-full flex justify-end gap-3">
          <Button onPress={router.back}>{tCommon("cancel")}</Button>
          <Button color="primary" isLoading={isSubmitting} type="submit">
            {isSubmitting ? tCommon("saving") : tCommon("save")}
          </Button>
        </div>
      </Form>
    </div>
  );
}
