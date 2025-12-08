/**
 * 树形结构工具函数
 */

interface TreeNode {
  id: string;
  parentId?: string | null;
  children?: TreeNode[];
  [key: string]: any;
}

/**
 * 将扁平数据转换为树形结构
 * @param items 扁平数据列表
 * @param idKey ID 字段名
 * @param parentKey 父ID 字段名
 */
export function buildTree<T extends TreeNode>(
  items: T[],
  idKey = 'id',
  parentKey = 'parentId',
): T[] {
  const map = new Map<string, T & { children: T[] }>();
  const roots: (T & { children: T[] })[] = [];

  // 1. 初始化 Map，每个节点添加 children 数组
  items.forEach((item) => {
    map.set(item[idKey], { ...item, children: [] });
  });

  // 2. 组装树
  items.forEach((item) => {
    const node = map.get(item[idKey])!;
    const parentId = item[parentKey];
    
    if (parentId) {
      const parent = map.get(parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // 父节点不存在时，作为根节点
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

/**
 * 构建科室树 (带医生数量统计)
 */
export function buildDepartmentTree(departments: any[]) {
  const map = new Map();
  const roots: any[] = [];

  // 预处理数据
  departments.forEach((dept) => {
    map.set(dept.id, {
      id: dept.id,
      name: dept.name,
      code: dept.code,
      introduction: dept.introduction,
      location: dept.location,
      phone: dept.phone,
      sort: dept.sort,
      status: dept.status,
      parentId: dept.parentId,
      hospitalId: dept.hospitalId,
      doctorCount: dept._count?.doctors ?? 0,
      children: [],
    });
  });

  // 组装树
  departments.forEach((dept) => {
    const node = map.get(dept.id);
    if (dept.parentId) {
      const parent = map.get(dept.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  // 按 sort 排序
  const sortNodes = (nodes: any[]) => {
    nodes.sort((a, b) => a.sort - b.sort);
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    });
  };
  sortNodes(roots);

  return roots;
}

