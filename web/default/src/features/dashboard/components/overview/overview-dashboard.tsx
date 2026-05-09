/*
Copyright (C) 2023-2026 QuantumNous

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

// Curapi customization: dramatically simplified from upstream's 735-line,
// 7-panel overview (Setup Guide hero + ApiInfoPanel + AnnouncementsPanel +
// FAQPanel + UptimePanel + SummaryCards) down to SummaryCards + UptimePanel.
//
// Why:
// - Resend-style dashboards favor a few clear data signals over busy panels
// - Curapi marketing (curapi.top) owns "get started" guidance — console
//   doesn't need a duplicate setup hero
// - Announcements / FAQ live on curapi.top (blog + docs)
// - API endpoint info is in /docs, not the dashboard
//
// Upstream merge conflicts on this file are expected. Resolve with "ours"
// strategy: the simplified body is intentional, not a regression.

import {
  CardStaggerContainer,
  CardStaggerItem,
} from '@/components/page-transition'
import { SummaryCards } from './summary-cards'
import { UptimePanel } from './uptime-panel'

export function OverviewDashboard() {
  return (
    <div className='flex flex-col gap-4'>
      <SummaryCards />
      <CardStaggerContainer>
        <CardStaggerItem>
          <UptimePanel />
        </CardStaggerItem>
      </CardStaggerContainer>
    </div>
  )
}
