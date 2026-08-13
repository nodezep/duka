import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Settings2, Warehouse } from "lucide-react";
import { useInventoryCenters, InventoryCenter } from "@/hooks/useInventoryCenters";
import { useLanguage } from "@/hooks/useLanguage";

export function InventoryCenters() {
  const { centers, isLoading, createCenter, updateCenter } = useInventoryCenters();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryCenter | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
    };

    if (editing) {
      await updateCenter.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createCenter.mutateAsync(payload);
    }
    setOpen(false);
    setEditing(null);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">{t("inv.centers.loading")}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t("inv.centers.title")}</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-2" />{t("inv.centers.new")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? t("inv.centers.edit") : t("inv.centers.new_title")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("inv.centers.name")}</Label>
                <Input id="name" name="name" defaultValue={editing?.name} placeholder={t("inv.centers.name_ph")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">{t("inv.centers.type")}</Label>
                <Select name="type" defaultValue={editing?.type || "warehouse"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse">{t("inv.centers.type_warehouse")}</SelectItem>
                    <SelectItem value="point_of_sale">{t("inv.centers.type_pos")}</SelectItem>
                    <SelectItem value="bar">{t("inv.centers.type_bar")}</SelectItem>
                    <SelectItem value="kitchen">{t("inv.centers.type_kitchen")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createCenter.isPending || updateCenter.isPending}>
                {editing ? t("inv.centers.save") : t("inv.centers.create")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("inv.centers.col.name")}</TableHead>
              <TableHead>{t("inv.centers.col.type")}</TableHead>
              <TableHead>{t("inv.centers.col.status")}</TableHead>
              <TableHead className="text-right">{t("inv.centers.col.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {centers.map((center) => (
              <TableRow key={center.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-muted-foreground" />
                  {center.name}
                </TableCell>
                <TableCell className="capitalize">{center.type.replace("_", " ")}</TableCell>
                <TableCell>
                  <Badge variant={center.status === "active" ? "default" : "secondary"} className={center.status === "active" ? "bg-success text-success-foreground" : ""}>
                    {center.status === "active" ? t("inv.centers.status.active") : t("inv.centers.status.inactive")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(center); setOpen(true); }}>
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
