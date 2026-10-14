// MaxEco Project Tracker Controller
// Track Solar EPC/Advisory and IT/Web client engagements and milestones

class ProjectsController {
  constructor() {}

  getSolarProjects() {
    return window.storage.getSolarProjects();
  }

  getItProjects() {
    return window.storage.getItProjects();
  }

  getSolarMilestoneOptions() {
    return [
      "Site Audit & Structural Feasibility",
      "APDCL Net-Metering NOC Submission",
      "Partner Equipment Procurement",
      "Civil & Structural Mounting",
      "Wiring, Inverter & CEIG Testing",
      "Commissioning & Handover"
    ];
  }

  getItMilestoneOptions() {
    return [
      "Discovery & Asset Collection",
      "Design Wireframe & Content Draft",
      "Website / Automation Development",
      "Testing & Responsive Verification",
      "Client Training & Handover"
    ];
  }

  calculateSolarProgress(project) {
    if (!project.milestones || project.milestones.length === 0) return 0;
    const completed = project.milestones.filter(m => m.status === 'Completed').length;
    return Math.round((completed / project.milestones.length) * 100);
  }

  calculateItProgress(project) {
    if (!project.milestones || project.milestones.length === 0) return 0;
    const completed = project.milestones.filter(m => m.status === 'Completed').length;
    return Math.round((completed / project.milestones.length) * 100);
  }
}

window.projectsController = new ProjectsController();
