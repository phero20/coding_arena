export interface DashboardSectionHeaderProps {
  title: string;
  description: string;
}

export function DashboardSectionHeader({ title, description }: DashboardSectionHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-3 mb-12 w-full max-w-3xl mx-auto">
      <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
        {title}
      </h2>
      <p className="text-base text-muted-foreground max-w-xl">
        {description}
      </p>
    </div>
  );
}
