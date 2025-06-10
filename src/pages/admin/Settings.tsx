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
          <h2 className="text-3xl font-bold" style={{ color: '#14140F' }}>Configurações</h2>
          <p style={{ color: '#34675C' }}>
            Gerencie sua conta e as configurações do sistema
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-2" style={{ backgroundColor: 'transparent' }}>
                <TabsTrigger 
                  value="account"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#34675C',
                    border: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = 'rgba(163, 204, 171, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    if (!target.getAttribute('data-state') || target.getAttribute('data-state') === 'inactive') {
                      target.style.backgroundColor = 'transparent';
                    }
                  }}
                  className="data-[state=active]:bg-[#053D38] data-[state=active]:text-white"
                >
                  Minha Conta
                </TabsTrigger>
                <TabsTrigger 
                  value="processes"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#34675C',
                    border: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor = 'rgba(163, 204, 171, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    if (!target.getAttribute('data-state') || target.getAttribute('data-state') === 'inactive') {
                      target.style.backgroundColor = 'transparent';
                    }
                  }}
                  className="data-[state=active]:bg-[#053D38] data-[state=active]:text-white"
                >
                  Tipos de Processo
                </TabsTrigger>
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
