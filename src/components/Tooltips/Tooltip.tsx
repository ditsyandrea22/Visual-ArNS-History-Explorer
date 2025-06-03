import { Tooltip as AntdTooltip, TooltipProps } from 'antd';
import { ReactNode } from 'react';

import { InfoIcon } from '../icons';

function Tooltip({
  message,
  icon = (
    <InfoIcon
      style={{ fontSize: '20px', fill: 'var(--text-grey)', width: '20px' }}
    />
  ),
  tooltipOverrides,
}: {
  message: JSX.Element | string;
  icon?: ReactNode;
  tooltipOverrides?: Partial<TooltipProps>;
}) {
  // Extract deprecated overlayInnerStyle, overlayStyle, and destroyTooltipOnHide, and merge into styles
  const {
    overlayInnerStyle,
    overlayStyle,
    destroyTooltipOnHide,
    styles: overrideStyles,
    ...restOverrides
  } = tooltipOverrides || {};

  // Compose the new styles prop for antd Tooltip
  const mergedStyles = {
    ...overrideStyles,
    root: {
      ...(overrideStyles && overrideStyles.root ? overrideStyles.root : {}),
      ...(overlayStyle ? overlayStyle : {}),
    },
    body: {
      ...(overrideStyles && overrideStyles.body ? overrideStyles.body : {}),
      ...(overlayInnerStyle ? overlayInnerStyle : {}),
    },
  };

  // Only pass boolean to destroyOnHidden
  const destroyOnHiddenFlag =
    typeof destroyTooltipOnHide === 'boolean' ? destroyTooltipOnHide : true;

  return (
    <>
      <AntdTooltip
        title={message}
        color="var(--box-color)"
        className="pointer"
        styles={mergedStyles}
        {...restOverrides}
        destroyOnHidden={destroyOnHiddenFlag}
      >
        {icon}
      </AntdTooltip>
    </>
  );
}

export default Tooltip;