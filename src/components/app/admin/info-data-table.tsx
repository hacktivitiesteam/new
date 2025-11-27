'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Edit, Trash2, Filter } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

import { Country, InfoItem } from '@/lib/definitions';
import { fetchAllInfoItems, fetchCountries, deleteInfoItem } from '@/lib/firebase-actions';
import { useToast } from '@/hooks/use-toast';
import InfoFormSheet from './info-form-sheet';
import { CATEGORIES } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestore } from '@/firebase';

export default function InfoDataTable() {
  const [data, setData] = React.useState<InfoItem[]>([]);
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const [isFormSheetOpen, setIsFormSheetOpen] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<InfoItem | null>(null);

  const { toast } = useToast();
  const firestore = useFirestore();

  const loadData = React.useCallback(async () => {
    if (!firestore) return;
    setLoading(true);
    try {
      const [itemsData, countriesData] = await Promise.all([fetchAllInfoItems(firestore), fetchCountries(firestore)]);
      setData(itemsData);
      setCountries(countriesData);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Xəta', description: 'Məlumatları yükləmək mümkün olmadı.' });
    } finally {
      setLoading(false);
    }
  }, [firestore, toast]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsFormSheetOpen(true);
  };

  const handleEditItem = (item: InfoItem) => {
    setSelectedItem(item);
    setIsFormSheetOpen(true);
  };
  
  const handleDeleteItem = (item: InfoItem) => {
    setSelectedItem(item);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem || !firestore) return;
    try {
      await deleteInfoItem(firestore, selectedItem.id);
      toast({ title: 'Uğurlu', description: `'${selectedItem.name || selectedItem.phrase}' məlumatı silindi.` });
      loadData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Xəta', description: 'Məlumatı silmək mümkün olmadı.' });
    } finally {
      setIsAlertOpen(false);
      setSelectedItem(null);
    }
  };

  const countryMap = React.useMemo(() => {
    return new Map(countries.map(c => [c.id, c.name]));
  }, [countries]);

  const categoryMap = React.useMemo(() => {
    return new Map(CATEGORIES.map(c => [c.id, c.name_az]));
  }, []);

  const columns: ColumnDef<InfoItem>[] = [
    {
      accessorKey: 'name',
      header: 'Başlıq',
      // The accessorFn tells the table how to get the value for this column.
      // It will check for `name`, and if it's not there, it will use `phrase`.
      // This value is then used for sorting, filtering, and displaying.
      accessorFn: (row) => row.name || row.phrase,
      cell: ({ row }) => <div className="font-medium">{row.original.name || row.original.phrase}</div>,
    },
    {
      accessorKey: 'countryId',
      header: 'Ölkə',
      cell: ({ row }) => countryMap.get(row.getValue('countryId')) || 'Bilinmir',
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'category',
      header: 'Kateqoriya',
      cell: ({ row }) => categoryMap.get(row.getValue('category')) || 'Bilinmir',
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menyu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditItem(item)}>
                <Edit className="mr-2 h-4 w-4" /> Redaktə et
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteItem(item)} className="text-red-500">
                <Trash2 className="mr-2 h-4 w-4" /> Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
     onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
      columnVisibility,
    },
  });

  const isFiltered = table.getState().columnFilters.length > 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-96 w-full rounded-md border" />
        <div className="flex items-center justify-end space-x-2 py-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4 gap-2">
        <Input
          placeholder="Axtar (Başlıq)..."
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Ölkə
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {countries.map(country => (
                        <DropdownMenuCheckboxItem
                            key={country.id}
                            checked={(table.getColumn('countryId')?.getFilterValue() as string[] || []).includes(country.id)}
                            onCheckedChange={checked => {
                                const currentFilter = (table.getColumn('countryId')?.getFilterValue() as string[] || []);
                                const newFilter = checked 
                                    ? [...currentFilter, country.id]
                                    : currentFilter.filter(id => id !== country.id);
                                table.getColumn('countryId')?.setFilterValue(newFilter.length ? newFilter : undefined);
                            }}
                        >
                            {country.name}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Kateqoriya
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {CATEGORIES.map(category => (
                         <DropdownMenuCheckboxItem
                            key={category.id}
                            checked={(table.getColumn('category')?.getFilterValue() as string[] || []).includes(category.id)}
                            onCheckedChange={checked => {
                                const currentFilter = (table.getColumn('category')?.getFilterValue() as string[] || []);
                                const newFilter = checked
                                    ? [...currentFilter, category.id]
                                    : currentFilter.filter(id => id !== category.id);
                                table.getColumn('category')?.setFilterValue(newFilter.length ? newFilter : undefined);
                            }}
                        >
                            {category.name_az}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            {isFiltered && (
                <Button variant="ghost" onClick={() => table.resetColumnFilters()}>
                    Sıfırla
                </Button>
            )}
            <Button onClick={handleAddItem}>
                <PlusCircle className="mr-2 h-4 w-4" /> Yeni Məlumat
            </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nəticə tapılmadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Əvvəlki
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Növbəti
        </Button>
      </div>
      <InfoFormSheet
        isOpen={isFormSheetOpen}
        onOpenChange={setIsFormSheetOpen}
        onFormSubmit={loadData}
        item={selectedItem}
        countries={countries}
      />
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Silməni təsdiqləyirsiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu əməliyyat geri qaytarıla bilməz. Bu, '{selectedItem?.name || selectedItem?.phrase}' məlumatını sistemdən siləcək.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Bəli, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
