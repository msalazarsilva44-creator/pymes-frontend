import DashboardLayout from '../components/DashboardLayout'

interface Props { title: string }
export default function PlaceholderPage({ title }: Props) {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <h2 className="text-xl font-bold text-mercarof-navy mb-2">{title}</h2>
        <p className="text-gray-500">Próximamente en esta sección.</p>
      </div>
    </DashboardLayout>
  )
}
