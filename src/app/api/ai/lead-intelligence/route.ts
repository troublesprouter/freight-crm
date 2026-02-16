import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/gemini';
import dbConnect from '@/lib/mongodb';
import Company from '@/lib/models/Company';
import { requireSession } from '@/lib/session';

// POST /api/ai/lead-intelligence — auto-fill company info from name
export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    const { companyId, companyName } = await req.json();

    const prompt = `You are a freight brokerage research assistant. Given the company name "${companyName}", find and return the following information in JSON format only (no markdown, no explanation):
{
  "address": "full address if found",
  "website": "company website URL",
  "industry": "industry/sector",
  "estimatedSize": "small/medium/large",
  "description": "one sentence description",
  "possibleLanes": ["lane1", "lane2"],
  "possibleCommodities": ["commodity1"],
  "possibleEquipment": ["Dry Van", "Reefer", etc]
}
Return only valid JSON. If you can't find info, use empty strings/arrays.`;

    const result = await generateContent(prompt);

    // Parse the JSON from the response
    let parsed: any = {};
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json({ raw: result, error: 'Could not parse AI response' });
    }

    // If companyId provided, update the company
    if (companyId) {
      await dbConnect();
      await Company.findOneAndUpdate(
        { _id: companyId, organizationId: session.user.organizationId },
        {
          $set: {
            address: parsed.address || undefined,
            website: parsed.website || undefined,
            industry: parsed.industry || undefined,
            'qualification.lanes': parsed.possibleLanes || [],
            'qualification.commodities': parsed.possibleCommodities || [],
            'qualification.equipmentTypes': parsed.possibleEquipment || [],
          },
        }
      );
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
