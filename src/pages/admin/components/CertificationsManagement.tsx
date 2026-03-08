import React, { useState } from 'react';
import { Loader2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { issueCertificate, deleteCertificate } from '@/lib/progressService';

interface CertificationsManagementProps {
    users: any[];
    certs: any[];
    certsLoading: boolean;
    loadCerts: () => Promise<void>;
    profile: any;
}

const CertificationsManagement: React.FC<CertificationsManagementProps> = ({ users, certs, certsLoading, loadCerts, profile }) => {
    const { toast } = useToast();
    const [certStudentId, setCertStudentId] = useState("");
    const [certLevel, setCertLevel] = useState("beginner");
    const [certFile, setCertFile] = useState<File | null>(null);
    const [certUploading, setCertUploading] = useState(false);

    const handleIssueCert = async () => {
        if (!certStudentId || !certFile) return;
        setCertUploading(true);
        try {
            const student = users.find((u) => u.uid === certStudentId);
            if (!student) throw new Error("Student not found");
            await issueCertificate(
                student.uid,
                student.name,
                student.email,
                certLevel,
                certFile,
                profile?.uid || ""
            );
            toast({ title: "Certificate Issued ✅", description: `Certificate sent to ${student.name}` });
            setCertStudentId("");
            setCertFile(null);
            loadCerts();
        } catch {
            toast({ title: "Error", description: "Failed to issue certificate", variant: "destructive" });
        } finally {
            setCertUploading(false);
        }
    };

    const handleDeleteCert = async (certId: string) => {
        if (!confirm("Delete this certificate?")) return;
        try {
            await deleteCertificate(certId);
            toast({ title: "Certificate deleted" });
            loadCerts();
        } catch {
            toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
        }
    };

    return (
        <>
            {/* Issue Certificate Form */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <h3 className="text-sm font-bold mb-3">🎓 Issue Certificate</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <Label className="text-xs">Student *</Label>
                            <select
                                value={certStudentId}
                                onChange={(e) => setCertStudentId(e.target.value)}
                                className="mt-1 w-full h-8 rounded-md border bg-background px-2 text-sm"
                            >
                                <option value="">Select student...</option>
                                {users.map((u) => (
                                    <option key={u.uid} value={u.uid}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label className="text-xs">Level</Label>
                            <select
                                value={certLevel}
                                onChange={(e) => setCertLevel(e.target.value)}
                                className="mt-1 w-full h-8 rounded-md border bg-background px-2 text-sm"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>
                    <div className="mb-4">
                        <Label className="text-xs mb-1 block">Certificate PDF *</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                                className="h-9 text-xs py-1 flex-1"
                            />
                            {certFile && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCertFile(null)}
                                    className="h-9 px-2 text-destructive shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                    <Button
                        onClick={handleIssueCert}
                        disabled={certUploading || !certStudentId || !certFile}
                        size="sm"
                        className="gradient-button"
                    >
                        {certUploading ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Uploading...</> : "📄 Issue Certificate"}
                    </Button>
                </CardContent>
            </Card>

            {/* Issued Certificates List */}
            <h3 className="text-sm font-bold mb-3">Issued Certificates</h3>
            {certsLoading ? (
                <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
            ) : certs.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">No certificates issued yet.</p>
            ) : (
                <div className="space-y-3">
                    {certs.map((c) => (
                        <Card key={c.id}>
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-bold">{c.studentName}</h4>
                                        <span className="text-xs font-bold px-2 py-0.5 rounded capitalize bg-green-500/10 text-green-500">Issued</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Level: {c.level} • {c.studentEmail}</p>
                                </div>
                                <div className="flex gap-2">
                                    <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer">
                                        <Button size="sm" variant="outline">📥 View PDF</Button>
                                    </a>
                                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteCert(c.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
};

export default CertificationsManagement;
