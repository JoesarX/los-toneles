import ProductForm from "@/components/admin/ProductForm";
import { getProductForAdmin } from "@/lib/products";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

const EditProductPage = async ({ params }: Props) => {
  const { id } = await params;
  const product = await getProductForAdmin(id);

  if (!product) {
    notFound();
  }

  return <ProductForm mode="edit" product={product} />;
};

export default EditProductPage;
