import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { techStack } = await request.json();
    const stackClean = techStack ? techStack.toLowerCase() : '';

    // Standard database array of available production projects matching enterprise needs
    const marketJobLeads = [
      { id: 'lead-1', company: 'Global Tech Systems', title: 'Remote React Developer', description: 'Requires high density proficiency building modular frontend web layouts.', keywords: ['react', 'typescript', 'javascript'] },
      { id: 'lead-2', company: 'CloudScale Infrastructure', title: 'Backend Cloud Architect', description: 'Architect robust pipelines and administer microservices containers.', keywords: ['node', 'sql', 'postgres', 'docker', 'aws', 'python'] },
      { id: 'lead-3', company: 'DevCraft Labs Inc', title: 'Full-Stack Developer Contract', description: 'Maintain complex full lifecycle system architectures with relational databases.', keywords: ['react', 'node', 'sql', 'typescript'] }
    ];

    // Filter leads dynamically based on user's specific skill competencies
    const filteredLeads = marketJobLeads.filter(lead => {
      if (!stackClean) return true;
      return lead.keywords.some(keyword => stackClean.includes(keyword));
    });

    return NextResponse.json({ success: true, leads: filteredLeads }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Lead sourcing sequence dropped: ' + error.message }, { status: 500 });
  }
}
