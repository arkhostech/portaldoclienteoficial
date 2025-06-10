import { useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent,
} from "@/components/ui/card";
import AccountTab from "@/components/admin/settings/AccountTab";
import ProcessTypesTab from "@/components/admin/settings/ProcessTypesTab";

const Settings = () => {
  return (
    <MainLayout title="Configurações">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Configurações</h2>
          <p className="text-muted-foreground">
            Gerencie sua conta e as configurações do sistema
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account">Minha Conta</TabsTrigger>
                <TabsTrigger value="processes">Tipos de Processo</TabsTrigger>
              </TabsList>
              <div className="mt-6">
                <TabsContent value="account" className="space-y-4">
                  <AccountTab />
                </TabsContent>
                <TabsContent value="processes" className="space-y-4">
                  <ProcessTypesTab />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Settings;
