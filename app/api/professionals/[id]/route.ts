import { NextRequest, NextResponse } from 'next/server';
import { getProfessionalById } from '@/lib/services/professionals';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const professionalId = parseInt(id);

        if (isNaN(professionalId)) {
            return NextResponse.json(
                { error: 'Invalid professional ID' },
                { status: 400 }
            );
        }

        const professional = getProfessionalById(professionalId);

        if (!professional) {
            return NextResponse.json(
                { error: 'Professional not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(professional);
    } catch (error) {
        console.error('Error fetching professional:', error);
        return NextResponse.json(
            { error: 'Failed to fetch professional' },
            { status: 500 }
        );
    }
}
