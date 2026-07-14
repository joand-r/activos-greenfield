import Link from "next/link";

const Breadcrumb = ({
  pageName,
  description,
}: {
  pageName: string;
  description: string;
}) => {
  return (
    <>
      <section className="relative z-10 overflow-hidden pt-6 pb-2 lg:pt-8">
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 md:w-8/12 lg:w-7/12">
              <div className="mb-4 max-w-[570px] md:mb-0">
                <h1 className="mb-1.5 text-xl font-bold text-black dark:text-white sm:text-2xl">
                  {pageName}
                </h1>
                <p className="text-xs font-semibold text-body-color/85">
                  {description}
                </p>
              </div>
            </div>
            <div className="w-full px-4 md:w-4/12 lg:w-5/12">
              <div className="text-start md:text-end">
                <ul className="flex items-center md:justify-end gap-1.5 text-xs font-bold">
                  <li className="flex items-center">
                    <Link
                      href="/"
                      className="text-body-color hover:text-primary transition-colors"
                    >
                      Home
                    </Link>
                    <span className="ml-2 block h-1.5 w-1.5 rotate-45 border-r border-t border-body-color"></span>
                  </li>
                  <li className="text-primary">
                    {pageName}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Breadcrumb;
