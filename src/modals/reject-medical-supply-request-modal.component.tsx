import React, { useState } from 'react';
import { Button, Form, ModalBody, ModalFooter, ModalHeader, TextArea, Layer } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type Order, showNotification, showSnackbar, useAbortController } from '@openmrs/esm-framework';
import { rejectMedicalSupplyOrder, useInvalidateCommodityOrders } from '../resources/medical-supply.resources';
import { commodityNoun, useCommodity } from '../commodity';
import styles from './reject-medical-supply-request-modal.scss';

interface RejectMedicalSupplyRequestModalProps {
  order: Order;
  closeModal: () => void;
}

const RejectMedicalSupplyRequestModal: React.FC<RejectMedicalSupplyRequestModalProps> = ({ order, closeModal }) => {
  const { t } = useTranslation();
  const [fulfillerComment, setFulfillerComment] = useState('');
  const abortController = useAbortController();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const invalidateOrders = useInvalidateCommodityOrders();
  const commodity = useCommodity();

  const handleRejectOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    rejectMedicalSupplyOrder(order.uuid, fulfillerComment, abortController).then(
      () => {
        invalidateOrders();
        setIsSubmitting(false);
        closeModal();
        showSnackbar({
          isLowContrast: true,
          title: t('orderRejected', 'Order rejected'),
          kind: 'success',
          subtitle: t(
            'rejectMedicalSupplyRequestSuccessMessage',
            'Medical supply request with order number "{{orderNumber}}" rejected successfully',
            { orderNumber: order.orderNumber },
          ),
        });
      },
      (err) => {
        setIsSubmitting(false);
        showNotification({
          title: t('errorRejectingOrder', 'Error rejecting order'),
          kind: 'error',
          critical: true,
          description: err?.message,
        });
      },
    );
  };

  return (
    <Form onSubmit={handleRejectOrder}>
      <ModalHeader
        closeModal={closeModal}
        title={`${t('rejectCommodityOrder', 'Reject {{commodity}} order', { commodity: commodityNoun(commodity) })} [${order.orderNumber}]`}
      />
      <ModalBody>
        <div className={styles.modalBody}>
          <Layer>
            <p className={styles.section}>{`${t('order', 'Order:')} ${order.concept?.display}`}</p>
          </Layer>
          <br />
          <Layer>
            <TextArea
              labelText={t('fulfillerComment', 'Fulfiller comment')}
              id="commentField"
              maxCount={500}
              enableCounter
              onChange={(e) => setFulfillerComment(e.target.value)}
            />
          </Layer>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="danger" type="submit" disabled={isSubmitting}>
          {t('reject', 'Reject')}
        </Button>
      </ModalFooter>
    </Form>
  );
};

export default RejectMedicalSupplyRequestModal;
