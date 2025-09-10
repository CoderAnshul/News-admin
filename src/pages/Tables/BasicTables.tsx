import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";

export default function BasicTables() {
  // Sample data for shorts
  const shorts = [
    {
      id: 1,
      title: "Short Title 1",
      media: "/images/sample1.jpg",
      text: "Short description 1",
      category: "Category A",
      views: 100,
    },
    {
      id: 2,
      title: "Short Title 2",
      media: "/images/sample2.jpg",
      text: "Short description 2",
      category: "Category B",
      views: 200,
    },
  ];

  const handleEdit = (id: number) => {
    // Edit logic here
    console.log("Edit", id);
  };

  const handleDelete = (id: number) => {
    // Delete logic here
    console.log("Delete", id);
  };

  return (
    <>
      <PageMeta
        title="React.js Basic Tables Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Basic Tables" />
      <div className="space-y-6">
        <ComponentCard title="Basic Table 1">
          <BasicTableOne
            shorts={shorts}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </ComponentCard>
      </div>
    </>
  );
}
