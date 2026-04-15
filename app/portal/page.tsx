import { redirect }   from 'next/navigation'
import { getSession } from '@/lib/session'
import SubUserDashboard   from '@/components/portal/SubUserDashboard'
import SuperUserDashboard from '@/components/portal/SuperUserDashboard'

export default async function PortalDashboard() {
  const session = await getSession()
  if (!session) redirect('/login')

  if (session.role === 'SUPER_USER' || session.role === 'OPERATOR') {
    return <SuperUserDashboard />
  }
  return <SubUserDashboard />
}
