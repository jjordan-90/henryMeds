import { Router } from "express";
import {
  addAppointmentSlot,
  getAvailableAppointments,
} from "../../controllers/appointmentsController";
import {
  createReservation,
  confirmReservation,
} from "../../controllers/reservationsController";

const router = Router();

// These would be separated into reservation routes and appointment routes but for now they are together
router.route("/appointments").post(addAppointmentSlot);

router.route("/appointments/:providerId").get(getAvailableAppointments);

router
  .route("/appointments/:appointmentId/reservations")
  .post(createReservation);

router.route("/reservations/:reservationId/confirm").put(confirmReservation);

export default router;

// In practice all of this documentation would be more thorough and detailed
// All the schemas, requests, responses, exceptions, and DTOs would be defined, again skipping that for speed

/**
 * @swagger
 * tags:
 *  name: Appointments
 *
 * /appointments:
 *  post:
 *    summary: Enables a provider to add a new appointment slot
 *    tags: [Appointments]
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              providerId:
 *                type: string
 *                description: ID of the Provider adding the appointment slot
 *              start:
 *                type: string
 *                format: date-time
 *                description: Start time of the appointment slot
 *              end:
 *                type: string
 *                format: date-time
 *                description: End time of the appointment slot
 *            required:
 *            - providerId
 *            - start
 *            - end
 *    responses:
 *      "201":
 *        description: Appointment slot(s) added successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                appointments:
 *                  type: array
 *                  items:
 *                    $ref: "#/components/schemas/Appointment"
 *      "400":
 *        $ref: "#/components/responses/BadRequest"
 *
 * /appointments/{providerId}:
 *  get:
 *    summary: Get available appointments slots by providerId
 *    tags: [Appointments]
 *    parameters:
 *      - providerId:
 *        name: providerId
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *        description: The ID of the provider to query
 *      - page:
 *        name: page
 *        in: query
 *        required: true
 *        schema:
 *          type: number
 *          format: int32
 *          example: 1
 *        description: The page number for pagination
 *      - limit:
 *        name: limit
 *        in: query
 *        required: true
 *        schema:
 *          type: number
 *          format: int32
 *        description: The number of items on a page
 *      - start:
 *        name: start
 *        in: query
 *        schema:
 *          type: string
 *          format: date-time
 *        description: The start date to search for appointment slots
 *      - end:
 *        name: end
 *        in: query
 *        schema:
 *          type: string
 *          format: date-time
 *        description: The end date to search for appointment slots
 *    responses:
 *      "200":
 *        description: Successfully retrieved the appointment slots
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                appointments:
 *                  type: array
 *                  items:
 *                   $ref: "#/components/schemas/Appointment"
 *                paginationDetails:
 *                  type: object
 *                  properties:
 *                    page:
 *                      type: number
 *                      format: int32
 *                    limit:
 *                      type: number
 *                      format: int32
 *                    totalCount:
 *                      type: number
 *                      format: int32
 *      "400":
 *        $ref: "#/components/responses/BadRequest"
 *      "404":
 *        $ref: "#/components/responses/NotFound"
 *
 * /appointments/{appointmentId}/reservations:
 *  post:
 *    summary: Create reservation for an appointment slot
 *    tags: [Appointments]
 *    parameters:
 *      - appointmentId:
 *        name: appointmentId
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *        description: ID of the appointment slot to reserve
 *    responses:
 *      "201":
 *        description: Successfully created a reservation
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                reservation:
 *                  $ref: "#/components/schemas/Reservation"
 *      "400":
 *        $ref: "#/components/responses/BadRequest"
 *
 *
 * /reservations/{reservationId}/confirm:
 *  put:
 *    summary: Confirm a reservation for an appointment slot
 *    tags: [Reservations]
 *    parameters:
 *      - reservationId:
 *        name: reservationId
 *        in: path
 *        required: true
 *        schema:
 *          type: string
 *        description: ID of the reservation to be confirmed
 *    responses:
 *      "200":
 *        description: Successfully confirmed a reservation
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                reservation:
 *                  $ref: "#/components/schemas/Reservation"
 *      "400":
 *        $ref: "#/components/responses/BadRequest"
 *
 * components:
 *  schemas:
 *    Reservation:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *        appointmentId:
 *          type: string
 *        clientId:
 *          type: string
 *        status:
 *          $ref: "#/components/schemas/ReservationStatus"
 *        createdAt:
 *          type: string
 *          format: date-time
 *        updatedAt:
 *          type: string
 *          format: date-time
 *    Appointment:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *        providerId:
 *          type: string
 *        start:
 *          type: string
 *          format: date-time
 *        end:
 *          type: string
 *          format: date-time
 *    ReservationStatus:
 *      type: string
 *      description: Status of a reservation
 *      enum:
 *        - pending
 *        - confirmed
 *        - canceled
 *        - expired
 *  responses:
 *    BadRequest:
 *      description: Invalid request payload or query parameters
 *    NotFound:
 *      description: Resource not found
 *
 */
