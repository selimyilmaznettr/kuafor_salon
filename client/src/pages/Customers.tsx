import { useCustomers, useDeleteCustomer } from "@/hooks/use-customers";
import { useState } from "react";
import { CustomerForm } from "@/components/CustomerForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  MoreVertical,
  Phone,
  Mail,
  Trash2,
  Edit
} from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type Customer } from "@shared/schema";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: customers, isLoading } = useCustomers(search);
  const deleteMutation = useDeleteCustomer();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-display text-foreground">Müşteriler</h1>
          <p className="text-muted-foreground mt-1">Müşteri listesi ve detayları.</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-12 shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
        >
          <Plus className="w-5 h-5 mr-2" />
          Müşteri Ekle
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="İsim, telefon veya e-posta ile ara..."
          className="pl-12 h-14 rounded-2xl border-border/60 bg-white shadow-sm focus:ring-primary/20 text-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Customers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : customers?.length === 0 ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-border">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Müşteri bulunamadı</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Sisteme ilk müşterinizi ekleyerek başlayın.
          </p>
          <Button
            variant="link"
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 text-primary"
          >
            Müşteri Oluştur
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {customers?.map((customer) => (
            <div
              key={customer.id}
              className="group bg-white rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 relative"
            >
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => setEditingCustomer(customer)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={() => setDeletingId(customer.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Link href={`/customers/${customer.id}`}>
                <div className="flex items-start gap-4 cursor-pointer">
                  <Avatar className="w-16 h-16 border-2 border-white shadow-md bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                    <AvatarFallback className="text-lg font-bold">
                      {getInitials(customer.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="pt-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {customer.fullName}
                    </h3>
                    <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" />
                        {customer.phoneNumber}
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5" />
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              {customer.notes && (
                <div className="mt-6 p-3 bg-muted/30 rounded-xl text-sm text-muted-foreground italic border border-border/50">
                  "{customer.notes.length > 60 ? customer.notes.slice(0, 60) + "..." : customer.notes}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CustomerForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingCustomer && (
        <CustomerForm
          open={!!editingCustomer}
          onOpenChange={(open) => !open && setEditingCustomer(undefined)}
          customer={editingCustomer}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Müşteri ve tüm randevu geçmişi silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper icon component
function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
