import { AdminShell } from '@/components/admin/admin-shell'
import { ProductConsole } from '@/components/admin/product-console'
import { requireAdminPage } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export default async function ProductsAdminPage() {
  await requireAdminPage()
  return <AdminShell active="/admin/products"><ProductConsole /></AdminShell>
}
