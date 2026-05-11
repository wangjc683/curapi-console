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

import React from 'react';
import { Tag, Space, Skeleton } from '@douyinfe/semi-ui';
import { renderQuota } from '../../../helpers';
import CompactModeToggle from '../../common/ui/CompactModeToggle';
import { useMinimumLoadingTime } from '../../../hooks/common/useMinimumLoadingTime';

const LogsActions = ({
  stat,
  loadingStat,
  showStat,
  compactMode,
  setCompactMode,
  t,
}) => {
  const showSkeleton = useMinimumLoadingTime(loadingStat);
  const needSkeleton = !showStat || showSkeleton;

  const placeholder = (
    <Space>
      <Skeleton.Title style={{ width: 108, height: 21, borderRadius: 6 }} />
      <Skeleton.Title style={{ width: 65, height: 21, borderRadius: 6 }} />
      <Skeleton.Title style={{ width: 64, height: 21, borderRadius: 6 }} />
    </Space>
  );

  return (
    <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-2 w-full'>
      {/* Curapi customization: replaced 3 colored Tag stats (blue/pink/white +
          heavy shadow) with neutral pill cards. Same content, calmer visual —
          stats should READ as data, not compete for attention. */}
      <Skeleton loading={needSkeleton} active placeholder={placeholder}>
        <Space spacing={12}>
          <Tag
            color='white'
            style={{
              fontWeight: 500,
              padding: '8px 14px',
              border: '1px solid var(--semi-color-border)',
            }}
            className='!rounded-lg'
          >
            <span className='text-gray-500 mr-1.5'>{t('消耗额度')}</span>
            <span className='font-semibold'>{renderQuota(stat.quota)}</span>
          </Tag>
          <Tag
            color='white'
            style={{
              fontWeight: 500,
              padding: '8px 14px',
              border: '1px solid var(--semi-color-border)',
            }}
            className='!rounded-lg'
          >
            <span className='text-gray-500 mr-1.5'>RPM</span>
            <span className='font-semibold'>{stat.rpm}</span>
          </Tag>
          <Tag
            color='white'
            style={{
              fontWeight: 500,
              padding: '8px 14px',
              border: '1px solid var(--semi-color-border)',
            }}
            className='!rounded-lg'
          >
            <span className='text-gray-500 mr-1.5'>TPM</span>
            <span className='font-semibold'>{stat.tpm}</span>
          </Tag>
        </Space>
      </Skeleton>

      <CompactModeToggle
        compactMode={compactMode}
        setCompactMode={setCompactMode}
        t={t}
      />
    </div>
  );
};

export default LogsActions;
