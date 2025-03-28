import { ShipmentRepository } from '../repositories/ShipmentRepository';

import { MailerService } from '../infrastructure/email/email';
import { UserRepository } from '../repositories/UserRepository';
import { ShipmentService } from './ShipmentService';
import { ShipmentAssignmentRepository } from '../repositories/ShipmentAssignmentRepository';
import { DriverRepository } from '../repositories/DriverRepository';
import { RouteRepository } from '../repositories/RouteRepository';
import { ShipmentAssignment, ShipmentAssignmentStatus } from '../domain/entities/ShipmentAssignment';
import { DriverStatus } from 'src/domain/entities/Driver';

export class ShipmentAssignmentService {
  private shipmentAssignmentRepository: ShipmentAssignmentRepository;
  private shipmentService: ShipmentService;
  private driverRepository: DriverRepository;
  private routeRepository: RouteRepository;
  private userRepository: UserRepository;
  private mailerService: MailerService;

  constructor(
    shipmentAssignmentRepository: ShipmentAssignmentRepository,
    shipmentRepository: ShipmentService, 
    driverRepository: DriverRepository,
    routeRepository: RouteRepository,
    userRepository: UserRepository,
    mailerService: MailerService
  ) {
    this.shipmentAssignmentRepository = shipmentAssignmentRepository;
    this.shipmentService = shipmentRepository;
    this.driverRepository = driverRepository;
    this.routeRepository = routeRepository;
    this.userRepository = userRepository;
    this.mailerService = mailerService;
  }

  async assignShipment(assignment: ShipmentAssignment): Promise<ShipmentAssignment | null> {
    const shipment = await this.shipmentService.find(assignment.shipment_id);
    if (!shipment) {
      throw new Error('El envío no existe');
    }

    const route = await this.routeRepository.findById(assignment.route_id);
    if (!route) {
      throw new Error('La ruta no existe');
    }
/*
    const driver = await this.driverRepository.findById(assignment.driver_id);
    if (!driver) {
      throw new Error('El conductor no existe');
    }
    
    if (driver.status !== DriverStatus.AVAILABLE) {
      throw new Error('El conductor no está disponible');
    }

    if (driver.vehicle_capacity < shipment.weight) {
      throw new Error('El vehículo del conductor no tiene capacidad suficiente');
    }

    // Verificar que el conductor no tenga ya asignaciones en progreso
    const driverAssignments = await this.shipmentAssignmentRepository.findByDriverId(driver.id);
    if (driverAssignments.length > 0) {
      throw new Error('El conductor ya tiene envíos asignados');
    }

    // Crear la asignación
    const result = await this.shipmentAssignmentRepository.create(assignment);
    
    // Actualizar el estado del conductor a BUSY
    await this.driverRepository.updateDriverStatus(driver.id, DriverStatus.BUSY);
    
    // Notificar al transportista por correo
    const user = await this.userRepository.findById(driver.id);
    if (user && user.email) {
      await this.mailerService.sendMail(
        user.email,
        "Nuevo envío asignado",
        `<p>Se te ha asignado un nuevo envío (ID: ${shipment.id}) con destino a ${shipment.destination}.</p>
        <p>Por favor, inicia la entrega lo antes posible.</p>`
      );
    }
*/
    return null;
  }
  
  async getShipmentAssignments(status?: ShipmentAssignmentStatus): Promise<any[]> {
    const assignments = await this.shipmentAssignmentRepository.findAllWithDetails();
    
    if (status) {
      return assignments.filter(a => a.status === status);
    }
    
    return assignments;
  }
  
  async updateAssignmentStatus(id: number, status: ShipmentAssignmentStatus): Promise<void> {
    await this.shipmentAssignmentRepository.updateStatus(id, status);
    
    // Si el estado es COMPLETED o CANCELLED, actualizar el estado del conductor
    if (status === ShipmentAssignmentStatus.COMPLETED || status === ShipmentAssignmentStatus.CANCELLED) {
      const assignment = await this.shipmentAssignmentRepository.findByShipmentId(id);
      if (assignment) {
        await this.driverRepository.updateDriverStatus(assignment.driver_id, DriverStatus.AVAILABLE);
      }
    }
  }
}