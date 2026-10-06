import { AdminShell } from '@/components/admin/admin-shell'
import { HomepageEditor } from '@/components/admin/homepage-editor'
import { requireAdminPage } from '@/lib/admin-auth'
import { homepageStorageConfigured, readHomepageContent } from '@/lib/homepage'

export const dynamic = 'force-dynamic'

export default async function HomepageAdminPage() {
  await requireAdminPage()
  const content = await readHomepageContent()
  return (
    <AdminShell active="/admin/homepage">
      <HomepageEditor initial={content} readOnly={!homepageStorageConfigured()} />
    </AdminShell>
  )
}
