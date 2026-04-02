/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Users,
  UserPlus,
  ClipboardList,
  Calendar,
  Target,
  Monitor,
  Cake,
  AlertTriangle,
  Wallet,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-6 rounded-lg">
      {/* Header com Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visão geral do seu negócio
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="bg-[#111113] border-[#1e1e20] text-white hover:bg-[#1e1e20]"
          >
            Todas filiais <ChevronDown className="ml-2 size-4" />
          </Button>
          <Button
            variant="outline"
            className="bg-[#111113] border-[#1e1e20] text-white hover:bg-[#1e1e20]"
          >
            30 dias <ChevronDown className="ml-2 size-4" />
          </Button>
        </div>
      </div>

      {/* Grid de Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="PROFISSIONAIS"
          value="1"
          icon={<Users className="size-4" />}
        />
        <StatCard
          title="CLIENTES TOTAIS"
          value="0"
          icon={<UserPlus className="size-4" />}
        />
        <StatCard
          title="COMANDAS ABERTAS"
          value="0"
          icon={<ClipboardList className="size-4" />}
        />
        <StatCard
          title="AGENDA HOJE"
          value="0"
          icon={<Calendar className="size-4" />}
        />
        <StatCard
          title="TAXA OCUPAÇÃO"
          value="0%"
          icon={<Target className="size-4" />}
        />

        <StatCard
          title="AGENDAMENTOS"
          value="0"
          subtitle="0 online"
          subtitleColor="text-emerald-500"
          icon={<Calendar className="size-4" />}
        />
        <StatCard
          title="VIA RECEPÇÃO"
          value="0"
          icon={<Users className="size-4" />}
        />
        <StatCard
          title="VIA ONLINE"
          value="0"
          icon={<Monitor className="size-4" />}
        />
        <StatCard
          title="ANIVERSARIANTES"
          value="0"
          icon={<Cake className="size-4" />}
        />
        <StatCard
          title="ESTOQUE BAIXO"
          value="0"
          icon={<AlertTriangle className="size-4" />}
        />

        <StatCard
          title="VENDAS (MÊS)"
          value="0"
          subtitle="R$ 0,00"
          subtitleColor="text-red-500"
          icon={<Wallet className="size-4" />}
        />
      </div>

      {/* Seção Resumo Financeiro */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#f5b82e]">
            <span className="text-lg font-bold">$</span>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Resumo Financeiro
            </h2>
          </div>
          <Button
            variant="link"
            className="text-[#f5b82e] text-xs gap-1 p-0 h-auto"
          >
            Ver tudo <ArrowUpRight className="size-3" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <FinanceCard
            title="Faturado"
            value="R$ 0,00"
            bgColor="bg-[#111113]"
            textColor="text-white"
          />
          <FinanceCard
            title="Recebido"
            value="R$ 0,00"
            bgColor="bg-[#062016]"
            textColor="text-emerald-500"
          />
          <FinanceCard
            title="A Receber"
            value="R$ 0,00"
            bgColor="bg-[#241a06]"
            textColor="text-[#f5b82e]"
          />
          <FinanceCard
            title="Contas a Pagar"
            value="R$ 0,00"
            bgColor="bg-[#20060a]"
            textColor="text-red-500"
          />
          <FinanceCard
            title="Saldo Atual"
            value="R$ 0,00"
            bgColor="bg-[#1a1606]"
            textColor="text-[#f5b82e]"
          />
        </div>
      </div>
    </div>
  );
}

// Sub-componente para os cards de estatística superiores
function StatCard({ title, value, icon, subtitle, subtitleColor }: any) {
  return (
    <Card className="bg-(--brand-card) border-(--border-card)  shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className="text-[#f5b82e]">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {subtitle && (
          <p className={`text-[10px] font-medium mt-1 ${subtitleColor}`}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Sub-componente para os cards financeiros coloridos
function FinanceCard({ title, value, bgColor, textColor }: any) {
  return (
    <Card className={`${bgColor} border-none shadow-sm`}>
      <CardContent className="pt-6">
        <p className="text-[10px] font-bold text-[#8b949e] uppercase mb-1">
          {title}
        </p>
        <div className={`text-xl font-bold ${textColor}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
