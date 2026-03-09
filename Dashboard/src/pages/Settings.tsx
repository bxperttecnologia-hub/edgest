import { Save, Building2, Mail, Bell, Lock, Palette, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Gerir preferências e parâmetros do sistema
          </p>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Guardar Alterações
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Informações da Instituição</CardTitle>
                  <CardDescription>Dados do centro de formação</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="institution-name">Nome da Instituição</Label>
                  <Input id="institution-name" defaultValue="Centro de Formação Profissional" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nif">NIF</Label>
                  <Input id="nif" defaultValue="123456789" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" defaultValue="Rua Principal, 123, Luanda" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" defaultValue="+244 923 456 789" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="info@formacao.ao" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Preferências do Sistema</CardTitle>
                  <CardDescription>Configurações gerais de funcionamento</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Idioma do Sistema</Label>
                  <p className="text-sm text-muted-foreground">Português (Portugal)</p>
                </div>
                <Button variant="outline" size="sm">Alterar</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Fuso Horário</Label>
                  <p className="text-sm text-muted-foreground">Africa/Luanda (GMT+1)</p>
                </div>
                <Button variant="outline" size="sm">Alterar</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Formato de Data</Label>
                  <p className="text-sm text-muted-foreground">DD/MM/AAAA</p>
                </div>
                <Button variant="outline" size="sm">Alterar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Notificações por Email</CardTitle>
                  <CardDescription>Configure os alertas que deseja receber</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Novas Matrículas</Label>
                  <p className="text-sm text-muted-foreground">Receber notificação de novas inscrições</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Pagamentos Recebidos</Label>
                  <p className="text-sm text-muted-foreground">Confirmação de pagamentos efetuados</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Pagamentos Atrasados</Label>
                  <p className="text-sm text-muted-foreground">Alerta de mensalidades em atraso</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Relatórios Semanais</Label>
                  <p className="text-sm text-muted-foreground">Resumo semanal de atividades</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Configurações de Email</CardTitle>
                  <CardDescription>Parâmetros de envio de emails</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtp-server">Servidor SMTP</Label>
                  <Input id="smtp-server" defaultValue="smtp.gmail.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">Porta</Label>
                  <Input id="smtp-port" defaultValue="587" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender-email">Email do Remetente</Label>
                <Input id="sender-email" type="email" defaultValue="noreply@formacao.ao" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sender-name">Nome do Remetente</Label>
                <Input id="sender-name" defaultValue="Centro de Formação" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Segurança e Privacidade</CardTitle>
                  <CardDescription>Gerir controlos de acesso e segurança</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">Adicionar camada extra de segurança</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sessões Simultâneas</Label>
                  <p className="text-sm text-muted-foreground">Permitir login em múltiplos dispositivos</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tempo de Sessão</Label>
                  <p className="text-sm text-muted-foreground">Logout automático após inatividade</p>
                </div>
                <Button variant="outline" size="sm">30 minutos</Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="current-password">Alterar Palavra-passe</Label>
                <Input id="current-password" type="password" placeholder="Palavra-passe atual" />
                <Input id="new-password" type="password" placeholder="Nova palavra-passe" />
                <Input id="confirm-password" type="password" placeholder="Confirmar nova palavra-passe" />
                <Button variant="outline" className="mt-2">Atualizar Palavra-passe</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Tema e Aparência</CardTitle>
                  <CardDescription>Personalizar a interface do sistema</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo Escuro</Label>
                  <p className="text-sm text-muted-foreground">Ativar tema escuro</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sidebar Compacto</Label>
                  <p className="text-sm text-muted-foreground">Reduzir tamanho da barra lateral</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Cor Principal</Label>
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-md bg-primary cursor-pointer border-2 border-primary"></div>
                  <div className="w-10 h-10 rounded-md bg-blue-500 cursor-pointer border-2 border-transparent hover:border-primary"></div>
                  <div className="w-10 h-10 rounded-md bg-green-500 cursor-pointer border-2 border-transparent hover:border-primary"></div>
                  <div className="w-10 h-10 rounded-md bg-purple-500 cursor-pointer border-2 border-transparent hover:border-primary"></div>
                  <div className="w-10 h-10 rounded-md bg-orange-500 cursor-pointer border-2 border-transparent hover:border-primary"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
