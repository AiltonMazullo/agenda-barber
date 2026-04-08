/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
  Package,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6 bg-[#0d1117] min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-[#8b949e] text-sm mt-1">
            Visão geral do seu negócio
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="bg-[#161b22] border-[#30363d] text-white hover:bg-[#21262d] h-9"
          >
            Todas filiais <ChevronDown className="ml-2 size-4 text-[#8b949e]" />
          </Button>
          <Button
            variant="outline"
            className="bg-[#161b22] border-[#30363d] text-white hover:bg-[#21262d] h-9"
          >
            30 dias <ChevronDown className="ml-2 size-4 text-[#8b949e]" />
          </Button>
        </div>
      </div>

      {/* Grid de Cards Principais - 5 Colunas */}
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

      {/* Resumo Financeiro */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#f5b82e] text-xl font-bold">$</span>
            <h2 className="text-xs font-bold uppercase tracking-widest">
              Resumo Financeiro
            </h2>
          </div>
          <Button
            variant="link"
            className="text-[#f5b82e] text-xs gap-1 p-0 h-auto font-medium"
          >
            Ver tudo <ArrowUpRight className="size-3" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <FinanceCard
            title="Faturado"
            value="R$ 0,00"
            bgColor="bg-[#161b22]"
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
            bgColor="bg-[#241a06]"
            textColor="text-[#f5b82e]"
          />
        </div>
      </div>

      {/* Seção Inferior: Assinaturas e Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assinaturas */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-2 text-[#f5b82e]">
              <ClipboardList className="size-4" />
              <CardTitle className="text-sm font-bold text-white uppercase">
                Assinaturas
              </CardTitle>
            </div>
            <Button
              variant="link"
              className="text-[#f5b82e] text-xs gap-1 p-0 h-auto"
            >
              Ver tudo <ArrowUpRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <MiniStatCard
              label="Ativos"
              value="0"
              color="text-emerald-500"
              bgColor="bg-[#062016]"
            />
            <MiniStatCard
              label="Inadimplentes"
              value="0"
              color="text-red-500"
              bgColor="bg-[#20060a]"
            />
            <MiniStatCard
              label="Novos no período"
              value="0"
              color="text-[#f5b82e]"
              bgColor="bg-[#241a06]"
            />
            <MiniStatCard
              label="Cancelados"
              value="0"
              color="text-slate-400"
              bgColor="bg-[#21262d]"
            />
          </CardContent>
        </Card>

        {/* Agenda do Dia */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-2 text-[#f5b82e]">
              <Calendar className="size-4" />
              <CardTitle className="text-sm font-bold text-white uppercase">
                Agenda do Dia
              </CardTitle>
            </div>
            <Button
              variant="link"
              className="text-[#f5b82e] text-xs gap-1 p-0 h-auto"
            >
              Ver agenda <ArrowUpRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[140px] text-[#8b949e]">
            <p className="text-sm">Nenhum agendamento para hoje.</p>
          </CardContent>
        </Card>

        {/* Ranking de Profissionais */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-2 text-[#f5b82e]">
              <TrendingUp className="size-4" />
              <CardTitle className="text-sm font-bold text-white uppercase">
                Ranking de Profissionais
              </CardTitle>
            </div>
            <Button
              variant="link"
              className="text-[#f5b82e] text-xs gap-1 p-0 h-auto"
            >
              Ver comissões <ArrowUpRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[100px] text-[#8b949e]">
            <p className="text-sm">Sem dados no período.</p>
          </CardContent>
        </Card>

        {/* Estoque Crítico */}
        <Card className="bg-[#161b22] border-[#30363d]">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-2 text-[#f5b82e]">
              <Package className="size-4" />
              <CardTitle className="text-sm font-bold text-white uppercase">
                Estoque Crítico
              </CardTitle>
            </div>
            <Button
              variant="link"
              className="text-[#f5b82e] text-xs gap-1 p-0 h-auto"
            >
              Ver estoque <ArrowUpRight className="size-3" />
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[100px] text-[#8b949e]">
            <div className="flex items-center gap-2 text-emerald-500/80">
              <CheckCircle2 className="size-4" />
              <p className="text-sm">Nenhum alerta de estoque.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Sub-componentes ---

function StatCard({ title, value, icon, subtitle, subtitleColor }: any) {
  return (
    <Card className="bg-[#161b22] border-[#30363d] shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
        <CardTitle className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className="text-[#f5b82e]">{icon}</div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-2xl font-bold text-white">{value}</div>
        {subtitle && (
          <p className={`text-[10px] font-medium mt-0.5 ${subtitleColor}`}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function FinanceCard({ title, value, bgColor, textColor }: any) {
  return (
    <Card className={`${bgColor} border-none shadow-none`}>
      <CardContent>
        <p className="text-[10px] font-bold text-[#8b949e] uppercase mb-1">
          {title}
        </p>
        <div className={`text-xl font-bold ${textColor}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function MiniStatCard({ label, value, color, bgColor }: any) {
  return (
    <div
      className={`${bgColor} rounded-md p-4 flex flex-col items-center justify-center text-center`}
    >
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      <span className="text-[10px] text-[#8b949e] font-medium uppercase mt-1">
        {label}
      </span>
    </div>
  );
}
