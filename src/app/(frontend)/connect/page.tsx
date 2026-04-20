import { db } from '@/lib/db'
import { siteSettings } from '@/lib/schema'
import InquiryForm from '@/components/connect/InquiryForm'
import ContactLinks from '@/components/connect/ContactLinks'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Connect',
  description: 'Get in touch with Richard Ramdial.',
}

export default async function ConnectPage() {
  const [settings] = await db.select().from(siteSettings).limit(1)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl font-serif font-bold mb-8">Connect</h1>
      <div className="space-y-12">
        <div>
          <h2 className="text-2xl font-serif font-bold mb-6">Send an Inquiry</h2>
          <InquiryForm contactEmail={settings?.contactEmail ?? undefined} />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold mb-6">Direct Contact</h2>
          <ContactLinks settings={settings ? {
            contactEmail: settings.contactEmail ?? undefined,
            linkedinUrl: settings.linkedinUrl ?? undefined,
            whatsappNumber: settings.whatsappNumber ?? undefined,
          } : undefined} />
        </div>
      </div>
    </div>
  )
}
