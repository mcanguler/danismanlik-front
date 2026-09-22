export function SectionHeading({
                                   align = "left",
                                   description,
                                   eyebrow,
                                   icon: Icon,
                                   pill = false,
                                   title,
                               }) {
    const alignment =
        align === "center" ? "text-center items-center mx-auto" : "items-start";

    if (pill) {
        return (
            <div className={`flex flex-col ${alignment} max-w-2xl mx-auto mb-16`}>
                {eyebrow !== "" && (
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blush-surface text-primary-container font-label-sm text-label-sm uppercase tracking-wider mb-3">
                        {Icon && <Icon className="size-4"/>}
                        <span>{eyebrow}</span>
                    </div>
                )}
                <h2 className="font-headline-lg text-headline-lg text-primary font-medium tracking-tight">
                    {title}
                </h2>
                {description && (
                    <p className="font-body-md text-body-md text-on-surface-variant mt-3">
                        {description}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className={`flex flex-col ${alignment} mb-10`}>
            {eyebrow !== "" && (
                <div
                    className="inline-flex items-center gap-2 text-burgundy-light font-label-sm text-label-sm uppercase tracking-[0.14em] font-semibold mb-2">
                    <span>{eyebrow}</span>
                    <span className="h-[1px] w-8 bg-burgundy-light"/>
                </div>
            )}
            <h2 className="font-headline-lg text-headline-lg text-primary font-medium tracking-tight">
                {title}
            </h2>
            {description && (
                <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-2">
                    {description}
                </p>
            )}
        </div>
    );
}