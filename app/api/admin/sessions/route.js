import { dbService } from '../../../../lib/database';

export async function GET() {
  try {
    const result = await dbService.getUserSessions();
    
    if (result.success) {
      return Response.json({ 
        success: true, 
        data: result.data 
      });
    } else {
      return Response.json({ 
        success: false, 
        message: 'Failed to fetch user sessions',
        error: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in GET /api/admin/sessions:', error);
    return Response.json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    }, { status: 500 });
  }
}
