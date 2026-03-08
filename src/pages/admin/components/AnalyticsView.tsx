import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AnalyticsViewProps {
    analytics: any;
    analyticsLoading: boolean;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, analyticsLoading }) => {
    return (
        <>
            <h2 className="text-lg font-bold mb-4">Performance Analytics</h2>
            {analyticsLoading ? (
                <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
            ) : !analytics ? (
                <p className="text-center text-muted-foreground text-sm py-8">No analytics data available.</p>
            ) : (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">Total Students</p>
                                <h3 className="text-2xl font-bold">{analytics.totalStudents}</h3>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">Total Exercises</p>
                                <h3 className="text-2xl font-bold">{analytics.totalExercises}</h3>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs text-muted-foreground mb-1 uppercase font-bold">Average Score</p>
                                <h3 className="text-2xl font-bold">{analytics.avgScore}%</h3>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Module Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {analytics.moduleStats.map((module: any) => (
                            <Card key={module.name}>
                                <CardHeader className="p-4 pb-0">
                                    <CardTitle className="text-sm font-bold">{module.name} Performance</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: "Success", value: module.success },
                                                    { name: "Failure", value: module.failure },
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                <Cell fill="#22c55e" />
                                                <Cell fill="#ef4444" />
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="text-center mt-[-160px] relative pointer-events-none">
                                        <p className="text-xl font-bold">{module.successRate}%</p>
                                        <p className="text-[10px] text-muted-foreground">Success Rate</p>
                                    </div>
                                    <div className="mt-[100px] text-center text-xs text-muted-foreground">
                                        {module.total} total exercises completed
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default AnalyticsView;
