'use client';
import { useState, useEffect } from 'react';
import CountryList from '@/components/app/admin/country-list';
import InfoDataTable from '@/components/app/admin/info-data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppHeader from '@/components/app/app-header';

export default function AdminDashboardPage() {
  return (
    <>
    <AppHeader isAdmin={true} />
    <main className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">İdarəetmə Paneli</h1>
        <p className="text-muted-foreground">Məzmun idarəetməsi.</p>
      </div>

      <Tabs defaultValue="countries">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="countries">Ölkələr</TabsTrigger>
          <TabsTrigger value="info-items">Məlumatlar</TabsTrigger>
        </TabsList>
        <TabsContent value="countries">
          <Card>
            <CardHeader>
              <CardTitle>Ölkə İdarəetməsi</CardTitle>
              <CardDescription>
                Yeni ölkələr əlavə edin, mövcud olanları redaktə edin və ya silin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CountryList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="info-items">
          <Card>
             <CardHeader>
              <CardTitle>Məlumat İdarəetməsi</CardTitle>
              <CardDescription>
                Ölkələr üçün otel, restoran, mədəniyyət və s. kimi məlumatları idarə edin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InfoDataTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
    </>
  );
}
