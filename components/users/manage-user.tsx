"use client";

import type { Selection, SortDescriptor } from "@heroui/react";

import { useTranslations, useLocale } from "next-intl";
import { useParams } from "next/navigation";
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
  Pagination,
  Spinner,
  addToast,
  Form,
  Divider,
  Chip,
  Select,
  SelectItem,
  CardBody,
  Checkbox,
  CardHeader,
  Card,
} from "@heroui/react";
import { useFormik } from "formik";
import {
  IconCircleCheck,
  IconCircleX,
  IconClockHour10,
  IconEye,
  IconEyeOff,
  IconListSearch,
} from "@tabler/icons-react";

import UserImageInput from "../ui/user-image-input";

import { useRouter } from "@/i18n/navigation";
import { IRole } from "@/interfaces/role";
import { rolesService } from "@/services/rolesService";
import { title } from "@/components/primitives";
import { UserSchema } from "@/schemas/user";
import { IUserFormData } from "@/interfaces/user";
import { usersService } from "@/services/usersService";
import { API_URL } from "@/constants";
import { UserStatus } from "@/enums/userStatus";
import { ColorType } from "@/types";

export default function ManageUser() {
  const router = useRouter();
  const locale = useLocale();
  const { userId } = useParams();
  const t = useTranslations("Users");
  const tRoles = useTranslations("Roles");
  const tCommon = useTranslations("Common");

  const columns = [
    { name: tRoles("denomination"), uid: "denomination", sortable: true },
    { name: tRoles("description"), uid: "description", sortable: true },
  ];

  const statusOptions = [
    { name: t("statusValues.enabled"), uid: 0 },
    { name: t("statusValues.disabled"), uid: 1 },
    { name: t("statusValues.pending"), uid: 2 },
  ];

  const statusIcons: Record<string, React.ReactNode> = {
    0: <IconCircleCheck stroke={1} />,
    1: <IconCircleX stroke={1} />,
    2: <IconClockHour10 stroke={1} />,
  };

  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

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
      const response = await rolesService.findAll({
        pageSize: rowsPerPage,
        pageNumber: page,
        orderBy: sortDescriptor.column.toString(),
        desc: sortDescriptor.direction === "descending",
        filter: debouncedFilter, // use debounced value here
        enabledOnly: true,
        allSelected: selectedKeys === "all",
      });

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
  ]);

  const hasSearchFilter = Boolean(filterValue);
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

  const totalPages = Math.ceil(totalRoles / rowsPerPage) || 1;

  const topContent = useMemo(() => {
    return (
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder={tRoles("searchPlaceholder")}
            startContent={<IconListSearch stroke={1} />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />
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
    onSearchChange,
    onRowsPerPageChange,
    totalRoles,
    hasSearchFilter,
    rowsPerPage,
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
  const selectedRoleIds = useMemo(() => {
    if (selectedKeys === "all") {
      // Select all roles
      return roles.map((role) => role.id);
    }
    // Otherwise, select only the checked ones

    return Array.from(selectedKeys) as string[];
  }, [selectedKeys, roles]);

  useEffect(() => {
    // Update the form values with the selected roles
    if (selectedRoleIds.length > 0) {
      setFieldValue("roles", selectedRoleIds);
    } else {
      setFieldValue("roles", []);
    }
  }, [selectedRoleIds]);

  const onSubmit = async (data: IUserFormData) => {
    const formData = new FormData();
    const {
      avatar,
      fullName,
      username,
      phone,
      email,
      password,
      status,
      roles,
    } = data;

    formData.append("fullName", fullName);
    formData.append("username", username);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("status", status.toString());
    roles.forEach((role) => formData.append("roles[]", role));
    if (password) formData.append("password", password);
    if (avatar) formData.append("avatar", avatar as File);

    if (userId) {
      const response = await usersService.update(
        userId.toString(),
        formData,
        {
          filter: debouncedFilter, // use debounced value here
          allSelected: selectedKeys === "all",
        },
        locale,
      );

      if (response?.ok) {
        toast("success", t("messages.updateSuccess"));
        router.push("/admin/users");
      } else {
        const { detail } = await response?.json();

        toast("danger", detail);
      }
    } else {
      const response = await usersService.create(
        formData,
        {
          filter: debouncedFilter, // use debounced value here
          allSelected: selectedKeys === "all",
        },
        locale,
      );

      if (response?.ok) {
        toast("success", t("messages.createSuccess"));
        router.push("/admin/users");
      } else {
        const { detail } = await response?.json();

        toast("danger", detail);
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
      fullName: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      passwordConfirmation: "",
      status: UserStatus.Enabled, // Default to enabled
      avatar: null, // Optional for updates
      roles: [], // This will be filled later with selected roles
    },
    validationSchema: UserSchema(t, userId?.toString()),
    onSubmit: onSubmit,
  });

  useEffect(() => {
    const fetchRole = async () => {
      if (userId) {
        const response = await usersService.findOne(userId.toString());

        if (response?.ok) {
          const user = await response?.json();

          if (user.roles.length) {
            setSelectedKeys(
              new Set(user?.roles.map((e: IRole) => e.id.toString())),
            );
          }
          if (user.avatar) {
            setAvatarPreview(`${API_URL}/uploads/${user.avatar}`);
          }
          void setValues({ ...user, status: user?.status.toString() });
        } else {
          toast("danger", t("messages.fetchError"));
        }
      }
    };

    void fetchRole();
  }, [userId]);

  useEffect(() => {
    if (errors.roles && isSubmitting) {
      toast("danger", t("messages.rolesRequired"));
    }
  }, [errors.roles, isSubmitting]);

  const toast = (color: ColorType, description: string) =>
    addToast({
      color: color,
      description: description,
      timeout: 3000,
      shouldShowTimeoutProgress: true,
    });

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

  return (
    <div className="w-full py-8 md:py-10">
      <div className="mb-8">
        <h3
          className={title({ size: "sm" })}
        >{`${userId ? tCommon("edit") : tCommon("add")} ${t("user")}`}</h3>
      </div>
      <Form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col w-full sm:flex-row justify-between gap-4">
          <div className="flex justify-start items-center">
            <UserImageInput
              avatarPreview={avatarPreview}
              handleFormImage={(image: File | null, imageUrl: string) => {
                handleChange({ target: { name: "avatar", value: image } });
                setAvatarPreview(imageUrl);
              }}
            />
          </div>
          <div className="flex flex-col w-full sm:flex-col gap-4">
            <Input
              isRequired
              errorMessage={errors.fullName}
              id="fullName"
              isInvalid={!!errors.fullName && touched.fullName}
              label={t("fullName")}
              labelPlacement="outside"
              name="fullName"
              placeholder={t("fullNamePlaceholder")}
              type="text"
              value={values.fullName}
              onBlur={handleBlur}
              onChange={handleChange}
            />
            <Input
              isRequired
              errorMessage={errors.username}
              id="username"
              isInvalid={!!errors.username && touched.username}
              label={t("username")}
              labelPlacement="outside"
              name="username"
              placeholder={t("usernamePlaceholder")}
              type="text"
              value={values.username}
              onBlur={handleBlur}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col w-full sm:flex-col gap-4">
            <Input
              isRequired
              errorMessage={errors.email}
              id="email"
              isInvalid={!!errors.email && touched.email}
              label={t("email")}
              labelPlacement="outside"
              name="email"
              placeholder={t("emailPlaceholder")}
              type="email"
              value={values.email}
              onBlur={handleBlur}
              onChange={handleChange}
            />
            <Input
              isRequired
              errorMessage={errors.phone}
              id="phone"
              isInvalid={!!errors.phone && touched.phone}
              label={t("phone")}
              labelPlacement="outside"
              name="phone"
              placeholder={t("phonePlaceholder")}
              type="tel"
              value={values.phone}
              onBlur={handleBlur}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="flex flex-col w-full sm:flex-col gap-4">
          <Input
            endContent={
              <button
                aria-label="toggle password visibility"
                className="focus:outline-none"
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <IconEyeOff stroke={2} />
                ) : (
                  <IconEye stroke={2} />
                )}
              </button>
            }
            errorMessage={errors.password}
            isInvalid={!!errors.password && touched.password}
            isRequired={!userId}
            label={t("password")}
            labelPlacement="outside"
            name="password"
            placeholder={t("passwordPlaceholder")}
            type={showPassword ? "text" : "password"}
            value={values.password}
            onBlur={handleBlur}
            onChange={handleChange}
          />
          <Input
            endContent={
              <button
                aria-label="toggle password confirmation visibility"
                className="focus:outline-none"
                type="button"
                onClick={() => setShowPasswordConfirm((prev) => !prev)}
              >
                {showPasswordConfirm ? (
                  <IconEyeOff stroke={2} />
                ) : (
                  <IconEye stroke={2} />
                )}
              </button>
            }
            errorMessage={errors.passwordConfirmation}
            isInvalid={
              !!errors.passwordConfirmation && touched.passwordConfirmation
            }
            isRequired={!userId}
            label={t("passwordConfirmation")}
            labelPlacement="outside"
            name="passwordConfirmation"
            placeholder={t("passConfirmPlaceholder")}
            type={showPasswordConfirm ? "text" : "password"}
            value={values.passwordConfirmation}
            onBlur={handleBlur}
            onChange={handleChange}
          />
        </div>
        <div className="flex flex-col w-full sm:flex-col gap-4">
          <Select
            isRequired
            description={t("statusPlaceholder")}
            endContent={statusIcons[values.status]}
            errorMessage={errors.status}
            isInvalid={!!errors.status && touched.status}
            label={t("status")}
            labelPlacement="outside"
            name="status"
            placeholder={t("statusPlaceholder")}
            selectedKeys={values.status.toString()}
            variant="flat"
            onBlur={handleBlur}
            onSelectionChange={(e) =>
              handleChange({
                target: {
                  name: "status",
                  value: e.currentKey || values.status.toString(),
                },
              })
            }
          >
            {statusOptions.map((status) => (
              <SelectItem key={status.uid}>{status.name}</SelectItem>
            ))}
          </Select>
        </div>
        <Divider className="my-2" />
        <h3 className="text-lg font-semibold">{t("roles")}</h3>
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
          <div className="block xl:hidden">
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
                {/* HEADER: SELECT ALL */}
                <div className="flex justify-between items-center px-2">
                  <Checkbox
                    isSelected={
                      selectedKeys === "all" ||
                      (selectedKeys.size === roles.length && roles.length > 0)
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
                    {selectedKeys === "all" ? totalRoles : selectedKeys.size}{" "}
                    {tCommon("selected")}
                  </span>
                </div>
                {roles.map((role) => {
                  const isSelected =
                    selectedKeys === "all" ||
                    selectedKeys.has(role.id.toString());

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
                        <div className="flex gap-3 justify-between items-center">
                          <div className="pointer-events-none">
                            <Checkbox isSelected={isSelected} />
                          </div>
                          <div className="flex flex-col">
                            <p className="text-small font-bold">
                              {role.denomination}
                            </p>
                          </div>
                        </div>
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
