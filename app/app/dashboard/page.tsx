"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEntreprises } from "../layout";
import { Entreprise } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useState, useEffect } from "react";

const CHART_COLORS = ["#000000", "#333333", "#666666", "#999999", "#CCCCCC"];

export default function DashboardPage() {
  const { entreprises, loading } = useEntreprises();
  const [stats, setStats] = useState({
    total: 0,
    byActivity: [] as { name: string; value: number }[],
    byCity: [] as { name: string; value: number }[],
    scoreDistribution: [] as { name: string; count: number }[],
    monthlyTrend: [] as { name: string; value: number }[],
    favoris: 0,
  });

  useEffect(() => {
    if (entreprises.length > 0) {
      calculateStats(entreprises);
    }
  }, [entreprises]);

  const calculateStats = (data: Entreprise[]) => {
    const activityCount: Record<string, number> = {};
    const cityCount: Record<string, number> = {};
    const scoreDistribution = Array(10)
      .fill(0)
      .map((_, i) => ({
        name: `${i + 1}`,
        count: 0,
      }));
    const monthlyTrend: Record<string, number> = {};
    let favorisCount = 0;

    data.forEach((entreprise) => {
      const activity = entreprise.activite_principale || "Autre";
      activityCount[activity] = (activityCount[activity] || 0) + 1;

      const city = entreprise.social_ville || "Autre";
      cityCount[city] = (cityCount[city] || 0) + 1;

      if (entreprise.score) {
        const scoreNum = parseInt(entreprise.score);
        if (!isNaN(scoreNum)) {
          const scoreIndex = Math.min(Math.max(scoreNum - 1, 0), 9);
          scoreDistribution[scoreIndex].count++;
        }
      }

      if (entreprise.dateparution) {
        const date = new Date(entreprise.dateparution);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        monthlyTrend[monthYear] = (monthlyTrend[monthYear] || 0) + 1;
      }

      if (entreprise.favori) favorisCount++;
    });

    setStats({
      total: data.length,
      byActivity: Object.entries(activityCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
      byCity: Object.entries(cityCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
      scoreDistribution,
      monthlyTrend: Object.entries(monthlyTrend)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => {
          const [aMonth, aYear] = a.name.split("/").map(Number);
          const [bMonth, bYear] = b.name.split("/").map(Number);
          return aYear === bYear ? aMonth - bMonth : aYear - bYear;
        }),
      favoris: favorisCount,
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>

        {/* Cartes KPI */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">entreprises</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Favoris</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.favoris}</div>
              <p className="text-sm text-muted-foreground">
                {stats.total > 0
                  ? Math.round((stats.favoris / stats.total) * 100)
                  : 0}
                %
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total > 0
                  ? (
                      stats.scoreDistribution.reduce(
                        (sum, curr, i) => sum + (i + 1) * curr.count,
                        0,
                      ) / stats.total
                    ).toFixed(1)
                  : "0.0"}
              </div>
              <p className="text-sm text-muted-foreground">/10</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Ville</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.byCity[0]?.name || "-"}
              </div>
              <p className="text-sm text-muted-foreground">
                {stats.byCity[0]?.value || 0} entreprises
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Activités principales</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {stats.byActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.byActivity}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {stats.byActivity.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    Aucune donnée disponible
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top villes</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {stats.byCity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byCity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Entreprises">
                      {stats.byCity.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    Aucune donnée disponible
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Graphiques pleine largeur */}
        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Distribution des scores</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Nombre" fill="#000000" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Évolution mensuelle</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {stats.monthlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#000000"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    Aucune donnée disponible
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Aperçu des données */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par ville</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.byCity.slice(0, 5).map((city, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-32">
                    <p className="font-medium">{city.name}</p>
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-black h-2.5 rounded-full"
                        style={{
                          width: `${(city.value / (stats.byCity[0]?.value || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 w-16 text-right">
                    <span className="font-medium">{city.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
