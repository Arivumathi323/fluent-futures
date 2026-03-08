import React from 'react';
import { Card } from '@/components/ui/card';

const BadgeManagement: React.FC = () => {
    return (
        <>
            <h2 className="text-xl font-bold font-display mb-1">Badge Management</h2>
            <p className="text-muted-foreground text-sm mb-6">Award badges to students from the Students tab</p>
            <Card className="p-6">
                <p className="text-sm text-muted-foreground">
                    To award or remove badges:
                </p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside mt-2 space-y-1">
                    <li>Go to the <strong>Students</strong> tab</li>
                    <li>Click on a student to view their details</li>
                    <li>Type a badge name and click <strong>Award</strong></li>
                    <li>Click the <strong>×</strong> next to a badge to remove it</li>
                </ol>
            </Card>
        </>
    );
};

export default BadgeManagement;
