"use client";

import { useTranslations } from "next-intl";
import { useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDraggable,
} from "@heroui/react";

type Props = {
  isDeleting: boolean;
  isOpen: boolean;
  onOpenChangeAction: (isOpen: boolean) => void;
  onDeleteAction: () => void;
  onCancelAction: () => void;
};

export default function DeleteConfirmationModal({
  isDeleting,
  isOpen,
  onOpenChangeAction,
  onDeleteAction,
  onCancelAction,
}: Props) {
  const targetRef = useRef(null);
  // @ts-ignore
  const { moveProps } = useDraggable({ targetRef, isDisabled: !isOpen });
  const tCommon = useTranslations("Common");

  return (
    <Modal
      ref={targetRef}
      backdrop="blur"
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={onOpenChangeAction}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader {...moveProps} className="flex flex-col gap-1">
              {tCommon("deleteConfirmationTitle")}
            </ModalHeader>
            <ModalBody>
              <p>{tCommon("deleteConfirmationMessage")}</p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={() => {
                  onCancelAction();
                  onClose();
                }}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                color="danger"
                isLoading={isDeleting}
                onPress={onDeleteAction}
              >
                {isDeleting ? tCommon("deleting") : tCommon("delete")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
