import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PartsForm from "@/components/PartsForm";
import DescriptionForm from "@/components/DescriptionForm";
import PackageForm from "@/components/PackagesForm";
import PartInterchangeForm from "@/components/PartInterchangeForm";
import PartImageUpload from "@/components/PartImageUpload";
import AllPartImagesDownload from "@/components/DownloadAllPartImages";
import XMLPartDataDownload from "@/components/XMLPartDataDownload";
export default async function ProtectedPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold text-center my-8">Add New Part</h1>
      <XMLPartDataDownload />
      <AllPartImagesDownload />
      <PartsForm />
      <DescriptionForm />
      <PackageForm />
      <PartInterchangeForm />
      <PartImageUpload />
    </div>
  );
}
