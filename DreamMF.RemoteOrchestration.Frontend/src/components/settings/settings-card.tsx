interface SettingsCardProps {
    title: string;
    children: React.ReactNode;
}

export function SettingsCard({ title, children }: SettingsCardProps) {
    return (
        <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );
}
