/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
// Curapi customization: header-level currency switcher (RMB ↔ USD).
// Writes the user's preference to localStorage (CURAPI_CURRENCY_KEY) which
// `getEffectiveQuotaDisplayType()` in helpers/utils.jsx reads with priority
// over the backend admin setting. Defaults to CNY when no preference is set.
// Mirrors the LanguageSelector pattern (same dropdown styling).
//
// Page reload on change: every callsite of getEffectiveQuotaDisplayType is a
// plain function, not a hook, so React won't re-render automatically when
// the localStorage value flips. A full reload guarantees every label updates
// without invasive context plumbing across dozens of files. v0.1 acceptable.

import React from 'react';
import { Button, Dropdown } from '@douyinfe/semi-ui';
import {
  CURAPI_CURRENCY_KEY,
  getEffectiveQuotaDisplayType,
} from '../../../helpers/utils';

const CurrencySelector = ({ t }) => {
  const current = getEffectiveQuotaDisplayType();
  // Normalize for the toggle UI: TOKENS / CUSTOM fall back to USD as the
  // "non-CNY" option so the dropdown is always a clean two-choice toggle.
  const visibleCurrent = current === 'CNY' ? 'CNY' : 'USD';
  const symbol = visibleCurrent === 'CNY' ? '¥' : '$';

  const setCurrency = (next) => {
    if (next === visibleCurrent) return;
    localStorage.setItem(CURAPI_CURRENCY_KEY, next);
    // Brute-force re-render: simpler than wiring a React context through every
    // helper. See module header for rationale.
    window.location.reload();
  };

  const itemClass = (active) =>
    `!px-3 !py-1.5 !text-sm !text-semi-color-text-0 dark:!text-gray-200 ${
      active
        ? '!bg-semi-color-primary-light-default dark:!bg-gray-600 !font-semibold'
        : 'hover:!bg-semi-color-fill-1 dark:hover:!bg-gray-600'
    }`;

  return (
    <Dropdown
      position='bottomRight'
      render={
        <Dropdown.Menu className='!bg-semi-color-bg-overlay !border-semi-color-border !shadow-lg !rounded-lg dark:!bg-gray-700 dark:!border-gray-600'>
          <Dropdown.Item
            onClick={() => setCurrency('CNY')}
            className={itemClass(visibleCurrent === 'CNY')}
          >
            <span className='font-mono mr-2'>¥</span>
            {t('人民币')}
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => setCurrency('USD')}
            className={itemClass(visibleCurrent === 'USD')}
          >
            <span className='font-mono mr-2'>$</span>
            {t('美元')}
          </Dropdown.Item>
        </Dropdown.Menu>
      }
    >
      <Button
        aria-label={t('切换货币')}
        theme='borderless'
        type='tertiary'
        className='!p-1.5 !text-current focus:!bg-semi-color-fill-1 dark:focus:!bg-gray-700 !rounded-full !bg-semi-color-fill-0 dark:!bg-semi-color-fill-1 hover:!bg-semi-color-fill-1 dark:hover:!bg-semi-color-fill-2 !font-mono !min-w-[28px] !text-sm !font-semibold'
      >
        {symbol}
      </Button>
    </Dropdown>
  );
};

export default CurrencySelector;
