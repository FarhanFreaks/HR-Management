import { supabase } from '../config/supabaseClient';

export const ATTENDANCE_SESSION_KEY = 'attendanceSession';
const ATTENDANCE_LOGGED_OUT_KEY = 'attendanceLoggedOut';

const getLocalDateString = (date = new Date()) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().split('T')[0];
};

const buildAttendanceSession = (user, employeeData, profileData = null) => {
  const profile = employeeData?.profiles || profileData;

  return {
    id: user.id,
    emp_id: employeeData?.emp_id || `EMP-${user.id.slice(0, 8).toUpperCase()}`,
    full_name: profile?.full_name || user.email,
    email: user.email,
    department: employeeData?.departments?.name || 'N/A',
    role: profile?.role || 'employee',
    loginTime: new Date().toISOString(),
  };
};

const fetchEmployeeRecord = async (userId) => {
  return supabase
    .from('employees')
    .select(`
      id,
      emp_id,
      status,
      profiles (full_name, role),
      departments (name)
    `)
    .eq('id', userId)
    .maybeSingle();
};

export const createAttendanceSession = async (user) => {
  if (!user?.id) {
    throw new Error('Please log in to mark attendance.');
  }

  const { data: employeeData, error } = await fetchEmployeeRecord(user.id);

  if (error) {
    throw new Error('Unable to check employee enrollment. Please contact HR.');
  }

  if (employeeData) {
    if (employeeData.status && employeeData.status.toLowerCase() !== 'active') {
      throw new Error('Your account is inactive. Please contact HR.');
    }

    return buildAttendanceSession(user, employeeData);
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profileData) {
    throw new Error('Company profile not found. Please contact HR.');
  }

  const generatedEmpId = `EMP-${user.id.slice(0, 8).toUpperCase()}`;
  const { error: enrollError } = await supabase
    .from('employees')
    .insert({
      id: user.id,
      emp_id: generatedEmpId,
      status: 'Active',
      joined_date: getLocalDateString(),
    });

  if (enrollError) {
    throw new Error('Your profile exists, but attendance enrollment is not enabled for this account. Please contact HR.');
  }

  const { data: enrolledEmployee, error: enrolledError } = await fetchEmployeeRecord(user.id);

  if (enrolledError || !enrolledEmployee) {
    throw new Error('Attendance enrollment could not be loaded. Please contact HR.');
  }

  return buildAttendanceSession(user, enrolledEmployee, profileData);
};

export const saveAttendanceSession = (sessionData) => {
  localStorage.removeItem(ATTENDANCE_LOGGED_OUT_KEY);
  localStorage.setItem(ATTENDANCE_SESSION_KEY, JSON.stringify(sessionData));
};

export const readAttendanceSession = () => {
  const storedSession = localStorage.getItem(ATTENDANCE_SESSION_KEY);
  if (!storedSession) return null;

  try {
    return JSON.parse(storedSession);
  } catch {
    localStorage.removeItem(ATTENDANCE_SESSION_KEY);
    return null;
  }
};

export const clearAttendanceSession = () => {
  localStorage.removeItem(ATTENDANCE_SESSION_KEY);
};

export const markAttendanceLoggedOut = () => {
  clearAttendanceSession();
  localStorage.setItem(ATTENDANCE_LOGGED_OUT_KEY, 'true');
};

export const wasAttendanceLoggedOut = () => {
  return localStorage.getItem(ATTENDANCE_LOGGED_OUT_KEY) === 'true';
};
