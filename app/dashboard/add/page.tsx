import PartsForm from "@/components/PartsForm";
import DescriptionForm from "@/components/DescriptionForm";
import PackageForm from "@/components/PackagesForm";
import PartInterchangeForm from "@/components/PartInterchangeForm";
import PartImageUpload from "@/components/PartImageUpload";
import BulkImportPartNumbers from "@/components/BulkImport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BulkImportPackages from "@/components/BulkImportPackages";
import BulkImportPartInterchanges from "@/components/BulkImportPartInterchanges";
import BulkImportDescriptions from "@/components/BulkImportDescriptions";
import WeightConverter from "@/components/WeightConverter";

export default async function Add() {
  return (
    <>
    <div className="w-full bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Bulk Import Parts</CardTitle>
          <CardDescription>Import multiple parts at once</CardDescription>
        </CardHeader>
        <CardContent>
          <BulkImportPartNumbers />
        </CardContent>
      </Card>  
      </div>
    </div>
    <div className="container mx-auto px-4 py-8 max-w-7xl sm:px-6 lg:px-8">
      <Tabs defaultValue="parts" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="descriptions">Descriptions</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="interchanges">Interchanges</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
        </TabsList>
        <TabsContent value="parts">
          <Card>
            <CardHeader>
              <CardTitle>Add New Part</CardTitle>
              <CardDescription>Enter the details for a new part</CardDescription>
            </CardHeader>
            <CardContent>
              <PartsForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="descriptions">
          <Card>
            <CardHeader>
              <CardTitle>Add Description</CardTitle>
              <CardDescription>Add a description for a part</CardDescription>
            </CardHeader>
            <CardContent>
              <BulkImportDescriptions />
              <hr />
              <DescriptionForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="packages">
          <Card>
            <CardHeader>
              <CardTitle>Add Package Information</CardTitle>
              <CardDescription>Enter package details for a part</CardDescription>
            </CardHeader>
            <CardContent>
              <BulkImportPackages />
              <hr />
              <PackageForm />
              <hr className=" my-6"/>
              <WeightConverter />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="interchanges">
          <Card>
            <CardHeader>
              <CardTitle>Add Part Interchange</CardTitle>
              <CardDescription>Enter interchange information for a part</CardDescription>
            </CardHeader>
            <CardContent>
              <BulkImportPartInterchanges />
              <hr />
              <PartInterchangeForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Upload Part Image</CardTitle>
              <CardDescription>Upload an image for a specific part</CardDescription>
            </CardHeader>
            <CardContent>
              <PartImageUpload />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}