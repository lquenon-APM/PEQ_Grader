import { renderHook, act } from '@testing-library/react';
import { useGlobalStore } from '../useGlobalStore';

describe('useGlobalStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useGlobalStore());
    act(() => {
      result.current.setSidebarOpen(true);
    });
  });

  it('should initialize with sidebarOpen as true', () => {
    const { result } = renderHook(() => useGlobalStore());
    expect(result.current.sidebarOpen).toBe(true);
  });

  it('should toggle sidebar state', () => {
    const { result } = renderHook(() => useGlobalStore());

    expect(result.current.sidebarOpen).toBe(true);

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.sidebarOpen).toBe(false);

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.sidebarOpen).toBe(true);
  });

  it('should set sidebar open state directly', () => {
    const { result } = renderHook(() => useGlobalStore());

    act(() => {
      result.current.setSidebarOpen(false);
    });

    expect(result.current.sidebarOpen).toBe(false);

    act(() => {
      result.current.setSidebarOpen(true);
    });

    expect(result.current.sidebarOpen).toBe(true);
  });

  it('should maintain state across multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useGlobalStore());
    const { result: result2 } = renderHook(() => useGlobalStore());

    act(() => {
      result1.current.setSidebarOpen(false);
    });

    expect(result1.current.sidebarOpen).toBe(false);
    expect(result2.current.sidebarOpen).toBe(false);
  });
});
