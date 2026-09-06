import AppLayout from "@/components/AppLayout";

const Placeholder = ({ title, description }: { title: string; description: string }) => (
  <AppLayout>
    <div className="p-4 lg:p-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      <div className="mt-8 text-center py-16 bg-card border border-border rounded-xl">
        <p className="text-muted-foreground text-sm">This section is under development.</p>
      </div>
    </div>
  </AppLayout>
);

export const PatientsPage = () => <Placeholder title="Patient Database" description="Manage and view reports for all registered patients." />;
export const CreateRequestPage = () => <Placeholder title="Initiate Consent Request" description="Request secure access to patient health records." />;
export const SendReportsPage = () => <Placeholder title="Send Reports" description="Share clinical reports with patients and providers." />;
export const UserDetailPage = () => <Placeholder title="User Details" description="View full patient profile and associated files." />;
